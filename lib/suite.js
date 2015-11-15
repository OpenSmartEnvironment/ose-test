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

exports.add = function(name, params, test) {  // {{{2
  if (arguments.length === 2) {
    test = params;
    params = {};
  }

  if (params.runtime && O.runtime !== params.runtime) return;

  this.cases.push({name: name, params: params, test: test});
};

