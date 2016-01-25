#!/usr/bin/env nodejs

'use strict';

const O = require('ose')(module);

// Public {{{1
exports.ose = {  // {{{2
  name: 'test',         // Name of this OSE instance
  space: 'testSpace',   // Space name this instance belongs to
  spid: 1,
};

exports.space = {  // {{{2
  id: 'ose/lib/space',      // Plugin module id
  name: 'testSpace',        // Name of the space
  home: 'test',             // Home instance of the space
};

exports.cli = {  // {{{2
  id: 'ose/lib/cli',

  // CLI can run some commands:
  /*
  script: [
    'wait 1000',
    'space testSpace',
    'info',
    'shard testShard',
    'info',
    'entry snaselj',
    'info',

    'entry heater1',
    'command power 0.5',

    'entry rpi',
    'command emulatePin {"pin": 15, "value": 1}',
    'wait 1000',
    'entry heater1',
    'command power 1',
    'wait 1000',
    'entry rpi',
    'command emulatePin {"pin": 15, "value": 0}',
    'wait 1000',

    'command emulatePin {"pin": 4, "value": 0}',
    'wait 100',
    'command emulatePin {"pin": 4, "value": 1}',
    'wait 1000',

    'entry camera1',
    'command still',
    'info',
    'detail',
  ],
  */
};

exports.http = {  // {{{2
  id: 'ose/lib/http',
  port: 4432,
};

exports['ose-html5'] = {  // {{{2
  dashboard: [],
  defaultStateObj:{
    main: {
      view: 'dashboard',
    }
  }
};

exports['ose-test'] = {  // {{{2
  suites: [
    'ose/test',
    'ose-fs/test',
//    'ose-test/test',
  ],
};

O.run(exports);  // {{{2

