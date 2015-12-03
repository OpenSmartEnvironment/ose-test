'use strict';

var O = require('ose').object(module, 'ose/lib/kind');
exports = O.exports;

// Public {{{1
exports.dprofile = true;

exports.init = function() {  // {{{2
  this.addDdes();
  this.ddes.add('name', 'text', {required: true});
  this.ddes.add('email', 'text');

  var schema = O.scope.getHomeSchema();
  schema.map({
    kind: 'test',
    field: 'name',
  });
//  O.new('ose-level/lib/field')(this.scope.schema.home, this, 'name');
};

// }}}1
