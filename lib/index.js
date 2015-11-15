'use strict';

var O = require('ose').module(module);
O.package = 'ose-test';
O.scope = 'test';

O.extend('chai', require('chai'));

var Suites = [];

/** Docs {{{1
 * @caption Test suite
 *
 * @readme
 *
 * @features
 *
 * @planned
 *
 * @scope test
 * @module test
 * @main test
 */

/**
 * @caption Test core
 *
 * @readme
 * Core singleton of ose-test npm package.
 *
 * @class test.lib
 * @type singleton
 */

// Public {{{1
exports.browserConfig = true;

exports.config = function(name, val, deps) {
  O.content('../content');

  if (val.suites) {
    for (var i = 0; i < val.suites.length; i++) {
      var idx = Suites.length;
      Suites.push(null);
      Suites[idx] = require(val.suites[i]);
    }
  }

  deps.add({after: 'lhs'}, function(cb) {
    cb();

    O.async.setImmediate(runAll);
  });
};

exports.add = function(suite) {
  Suites.push(suite);
};

// Private {{{1
function runAll() {  // {{{2
  O.log.notice('Starting tests ...');

  O.async.eachSeries(
    Suites,
    function(testcase, cb) {
      testcase.run(cb);
    },
    function(err) {
      if (err) {
        O.log.notice('... tests finished with error: ');
        O.log.error(err);
        return;
      }

      O.log.notice('... tests finished OK');
      return;
    }
  );
}

// }}}1
