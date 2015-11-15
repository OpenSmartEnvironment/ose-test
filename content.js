'use strict';

var O = require('ose').object(module, 'ose/lib/http/content');
exports = O.init();

/** Docs  {{{1
 * @module test
 */

/**
 * @caption Test suite content
 *
 * @readme
 * Provides files of [ose-test] package to the browser.
 *
 * @class test.content
 * @type singleton
 * @extends ose.lib.http.content
 */

// Public {{{1

exports.addModule('node_modules/assert/assert.js', 'assert');
exports.addModule('node_modules/chai/chai.js', 'chai');

exports.addModule('lib/browser');
exports.addModule('lib/gaia');
exports.addModule('lib/index');
exports.addModule('lib/kind/index');
exports.addModule('lib/suite');
