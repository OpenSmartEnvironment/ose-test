'use strict';

const O = require('ose')(module)
  .singleton('ose-test/lib/suite')
  .prepend('node')
;

exports = O.init('test/test');

if (O.runtime === 'browser') {
  require('ose-test').add(require('./browser'));
}

require('./schema');

var Assert = O.chai.assert;
var Equal = Assert.equal;

// Tests {{{1
var Email = 'snaselj@gmail.com';
var Alias = 'snaselj';

exports.cleanup = function(err) {  // {{{2
  if (exports.shard) {
    exports.shard.removeCommand('test');
    delete exports.shard;
  }

  delete exports.space;

  exports.socket && exports.socket.removeAllListeners();
  exports.entrySocket && exports.entrySocket.removeAllListeners();

  if (O.link.canClose(exports.socket)) O.link.close(exports.socket);
  if (O.link.canClose(exports.entrySocket)) O.link.close(exports.entrySocket);

  exports.socket = null;
  exports.entrySocket = null;
};

exports.add('Get space', function(cb) {  // {{{2
  O.data.getSpace('testSpace', function(err, space) {
    if (err) return cb(err);

    Equal(space.SUBJECT_STATE.READY, space.subjectState, 'exports.space state');
    Equal('testSpace', space.name, 'exports.space name');

    exports.space = space;

    return cb();
  });
});

exports.add('Find shard', function(cb) {  // {{{2
  exports.space.findShard('testShard', function(err, shard) {
    if (err) return cb(err);

    Equal(shard.SUBJECT_STATE.READY, shard.subjectState, 'exports.shard state');
    Equal('testShard', shard.alias, 'exports.shard alias');

    exports.shard = shard;

    return cb();
  });
});

exports.add('Get shard', function(cb) {  // {{{2
  exports.space.getShard(exports.shard.id, function(err, shard) {
    if (err) return cb(err);

    Equal(shard.SUBJECT_STATE.READY, shard.subjectState, 'exports.shard state');
    Equal(exports.shard, shard, 'exports.shard');

    return cb();
  });
});

exports.add('Add entry', {runtime: 'node'}, function(cb) {  // {{{2
  var trans = exports.shard.transaction();

  trans.add('kind', {
    alias: Alias,
    name: 'Jan Snášel',
    email: Email,
  });

  trans.commit(cb);
});

exports.add('Find entry', function(cb) {  // {{{2
  exports.shard.find(Alias, function(err, entry) {
    if (err) return cb(err);

    Equal(entry.SUBJECT_STATE.READY, entry.subjectState, 'Entry state');
    Equal(Alias, entry.dval.alias, 'Entry alias');
    Equal('Jan Snášel', entry.dval.name, 'Entry dval name');
    Equal(Email, entry.dval.email, 'Entry dval email');

    exports.entry = entry;
    exports.entryId = entry.id;

    return cb();
  });
});

exports.add('Get entry', function(cb) {  // {{{2
  exports.shard.get(exports.entry.id, function(err, entry) {
    if (err) return cb(err);

    Equal(entry.SUBJECT_STATE.READY, entry.subjectState, 'Entry state');
    Equal(exports.entry, entry, 'Entry');

    return cb();
  });
});

exports.add('Track entry', function(cb) {  // {{{2
  var socket = exports.shard.track(exports.entry.id);
  socket.on('error', cb);
  socket.on('close', cb);
  socket.on('open', function(entry) {
    Equal(entry.SUBJECT_STATE.READY, entry.subjectState, 'Entry state');
    Equal(exports.entry, entry, 'Entry');

    if (O.runtime === 'browser') {
      Equal(entry, entry.master.subject, 'Entry master');
    }

    return cb();
  });

  exports.entrySocket = socket;
});

exports.add('Connect backend', {runtime: 'browser'}, function(cb) {  // {{{2
  var socket = O.new('EventEmitter')();
  exports.shard.sendMaster('command', {name: 'test'}, socket);
  socket.on('open', cb);
  socket.on('error', cb);
  socket.on('close', function() {
    cb(O.error('Close should not be called'));
  });

  exports.socket = socket;
});

exports.add('Await browser', {runtime: 'node', timeout: 60*1000}, function(cb) {  // {{{2
//  return cb();

  var socket = O.new('EventEmitter')();
  exports.shard.addCommand('test', socket);
  socket.on('error', cb);
  socket.on('open', function(shard, name, data, client) {
    O.link.open(socket, client);
    return cb()
  });
  socket.on('close', function() {
    cb(O.error('Close should not be called'));
  });

  exports.socket = socket;
});

exports.add('Update entry browser', {runtime: 'browser'}, function(cb) {  // {{{2
  exports.entrySocket.once('patch', function(patch) {
    Assert(Boolean(patch.drev), '`drev` exist');
    Email = 'snaselj@opensmartenvironment.org';
    Alias = 'snaselj2';
    Equal(Alias, patch.dpatch.alias, 'alias');
    Equal(Email, patch.dpatch.email, 'email');

    return cb();
  });
});

exports.add('Update entry node', {runtime: 'node'}, function(cb) {  // {{{2
  Email = 'snaselj@opensmartenvironment.org';
  Alias = 'snaselj2';

  exports.entrySocket.once('patch', function(patch) {
    Assert(Boolean(patch.drev), '`drev` exist');
    Equal(Alias, patch.dpatch.alias, 'alias');
    Equal(Email, patch.dpatch.email, 'email');

    return cb();
  });

  var trans = exports.shard.transaction();
  trans.patch(exports.entry, {
    email: Email,
    alias: Alias,
  });
  trans.commit(function(err) {
    if (err) return cb(err);
    return;
  });
});

exports.add('Remove entry', function(cb) {  // {{{2
  exports.entrySocket.removeAllListeners();
  exports.entrySocket.on('close', function() {
    return cb(O.error('`error` should be invoked'));
  });
  exports.entrySocket.on('error', function(err) {
    delete exports.entrySocket;
    delete exports.entry;
    return cb();
  });

  exports.entry.remove('TEST_ERROR');

  Assert(! (exports.entry.id in exports.shard.cache), 'Entry removed');
  Equal('TEST_ERROR', exports.entry._err.code, 'Entry error code');
  Equal(exports.entry, exports.entry._err.subject, 'Entry error code');
});

exports.repeat('Find entry');  // {{{2

exports.repeat('Track entry');  // {{{2

exports.add('Query alias', function(cb) {  // {{{2
  exports.shard.query('alias', function(err, vals) {
    if (err) return cb(err);

    Equal(1, vals.length, 'Values');
    Equal(exports.entry.id, vals[0]);

    return cb();
  });
});

exports.add('Query missing map', function(cb) {  // {{{2
  exports.shard.query('map_not_exist', function(err, vals) {
    Equal(1, arguments.length, 'Arguments length');
    Equal('MAP_NOT_FOUND', err.code, 'Error code');

    return cb();
  });
});

exports.add('Delete entry', function(cb) {  // {{{2
  exports.entrySocket.removeAllListeners();
  exports.entrySocket.on('close', function() {
    return cb(O.error('`error` should be invoked'));
  });
  exports.entrySocket.on('error', function(err) {
    Assert(! (exports.entry.id in exports.shard.cache), 'Entry removed');
    Equal('ENTRY_DELETED', err.code, 'Entry error code');

    delete exports.entrySocket;
    delete exports.entry;
    return cb();
  });

  if (O.runtime === 'browser') {
    return O.link.send(exports.socket, 'can');  // Notify backend
  }

  return exports.socket.once('can', function() {  // Wait for the browser
    var trans = exports.shard.transaction();
    trans.del(exports.entry);
    trans.commit(function(err) {
      if (err) cb(err);
    });
  });
});

exports.add('Find deleted entry', function(cb) {  // {{{2
  exports.shard.find(Alias, function(err, entry) {
    Equal(1, arguments.length, 'Arguments length');
    Equal('ENTRY_NOT_FOUND', err.code, 'Error code');

    return cb();
  });
});

exports.add('Generate entries', {runtime: 'node'}, function(cb) {  // {{{2
  var trans = exports.shard.transaction();

  for (var i = 0; i < 3; i++) {
    trans.add('kind', {
      alias: Alias + '_' + i,
      name: 'Jan Snášel' + '_' + i,
      email: Email + '_' + i,
    });
  }

  trans.commit(cb);
});

exports.add('Finish', function(cb) {  // {{{2
  exports.socket.removeAllListeners();
  exports.socket.on('close', cb);
  exports.socket.on('error', cb);

  if (O.runtime === 'browser') {
    return O.link.close(exports.socket);
  }
});

