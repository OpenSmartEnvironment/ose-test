'use strict';

var O = require('ose').module(module);

var Content = require('../content');
Content.addModule('test/browser');
Content.addModule('test/index');
Content.addModule('test/kind/gaia/detail');
Content.addModule('test/kind/index');
Content.addModule('test/schema');

require('ose/lib/plugins').read({  // {{{1
  testShard: {  // {{{2
    id: 'ose/lib/shard',
    sid: 1,               // Shard id unique within the space
    alias: 'testShard',   // Shard alias
    schema: 'test',       // Schema the shard belongs to
  },

  testDashboard: function(name, val, deps) {  // {{{2
    var d = require('ose/lib/plugins').plugins['ose-gaia'].data.dashboard;
    d.push({
      caption: 'Aliases',
      view: 'list',
      ident: {
        map: 'alias',
        shard: 'testShard',
      }
    });
    d.push({
      caption: 'Kinds',
      view: 'list',
      ident: {
        map: 'kind/name',
        shard: 'testShard',
      }
    });
  },

  // }}}2
});

