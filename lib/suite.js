'use strict';

var O = require('ose').class(module, C);

// Public {{{1
function C(name) {  // {{{2
  this.name = name;
  this.timeout = 2000;

  this.cases = [];
}

exports.run = function(cb) {  // {{{2
  O.log.notice('Starting test suite ...', this.name);

  var that = this;

  O.async.eachSeries(this.cases,
  function(val, cb) {
    console.log('TEST CASE:', val.name);

    var timeout = setTimeout(function() {
      timeout = null;
      cb(O.error(that, 'Test case timed out', val.name));
    }, val.params.timeout || that.timeout);

    return O.async.nextTick(function() {
      val.test(function(err) {
        if (! cb) {
          return O.log.error(that, 'Test case tries to call callback multiple times', {case: that.name, name: val.name});
        }

        if (! timeout) {
          cb = null;
          return O.log.error(that, 'Test case was finished after timeout', {case: that.name, name: val.name});
        }

        clearTimeout(timeout);
        timeout = null;
        var fn = cb;
        cb = null;
        if (err) {
          fn(err);
        } else {
          fn();
        }
        return;
      });
    });
  },
  function(err) {
    that.cleanup && that.cleanup(err);

    if (err) return cb(err);

    O.log.notice('... test suite finished OK', that.name);
    return cb();
  });
};

exports.repeat = function(name, params) {  // {{{2
  for (var i = 0; i < this.cases.length; i++) {
    var val = this.cases[i];
    if (val.name === name) {
      this.add('Repeat: ' + name, params || val.params, val.test);
      return;
    }
  }

  throw O.log.error(this, 'Test case was not found', name);
};

exports.connectBrowser = function(getShard) {  // {{{2
  var socket = O.new('EventEmitter')();

  if (O.runtime === 'node') {
    this.add('Await browser', {runtime: 'node', timeout: 60*1000}, function(cb) {
      socket.on('error', cb);
      socket.on('open', function(shard, name, data, client) {
        shard.removeCommand('test');
        O.link.open(socket, client);
        return cb()
      });
      socket.on('close', function() {
        return cb(O.error('Close should not be called'));
      });

      return getShard(function(err, shard) {
        if (err) return cb(err);
        shard.addCommand('test', socket);
      });
    });
  } else {
    this.add('Connect backend', {runtime: 'browser'}, function(cb) {
      socket.on('open', cb);
      socket.on('error', cb);
      socket.on('close', function() {
        return cb(O.error('Close should not be called'));
      });

      return getShard(function(err, shard) {
        if (err) return cb(err);
        return shard.sendMaster('command', {name: 'test'}, socket);
      });
    });
  }

  return socket;
};

exports.awaitSocket = function(socket, ident) {  // {{{2
  if (! ident) {
    if (this.lastIdent) {
      ident = ++this.lastIdent;
    } else {
      ident = this.lastIdent = 1;
    }
  }

  this.add('Await socket ' + ident, function(cb) {
    var await = function(data, client) {
      if (data === ident) {
        O.link.close(client, ident);
        return cb();
      }

      return cb(O.link.error(O.error(socket, 'Invalid await ident', data)));
    };

    socket.once('await', await);

    O.link.send(socket, 'await', ident, function(err, data) {
      if (err) return;

      socket.removeListener('await', await);

      if (data === ident) return cb();

      return cb(O.error(socket, 'Invalid await ident', data));
    });
  });
};

exports.finishSocket = function(socket) {  // {{{2
  this.add('Remove socket listeners', function(cb) {
    socket.removeAllListeners();
    socket.on('error', O._.noop);
    cb();
  });

  this.awaitSocket(socket);

  this.add('Finish', function(cb) {
    if (O.link.canClose(socket)) O.link.close(socket);

    return cb();
  });
};

exports.add = function(name, params, test) {  // {{{2
  if (arguments.length === 2) {
    test = params;
    params = {};
  }

  if (params.runtime && O.runtime !== params.runtime) return;

  this.cases.push({name: name, params: params, test: test});
};

