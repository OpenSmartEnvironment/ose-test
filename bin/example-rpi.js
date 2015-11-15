#!/usr/bin/env nodejs

'use strict';

var Example = require('ose-example-rpi/bin/run');

var O = require('ose').module(module);

exports['ose-test'] = {
  suites: [
    'ose/test',
  ],
};

require('ose/lib/plugins').read(exports);

