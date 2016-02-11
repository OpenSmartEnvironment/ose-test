'use strict';

const O = require('ose')(module)
  .setPackage('ose-test')
;

O.content('../content');
O.extendO('chai', require('chai'));

var Suites = [];

/** Docs {{{1
 * @caption OSE testing framework
 *
 * @readme
 *
 * @features
 *
 * @planned
 *
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

exports.config = function(name, val, deps) {  // {{{2
  Array.isArray(val.suites) && val.suites.forEach(function(suite) {
    // Workaround for requiring suite from other suite - keep order defined by `val` array
    var idx = Suites.length;
    Suites.push(undefined);

    O.async.setImmediate(function() {
      Suites[idx] = require(suite);
    });
  });


  deps.add({after: 'finish'}, function(cb) {
    cb();

    O.async.setImmediate(runAll);
  });
};

exports.add = function(suite) {  // {{{2
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
