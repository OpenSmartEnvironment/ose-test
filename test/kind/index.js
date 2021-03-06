'use strict';

const O = require('ose')(module)
  .singleton('ose/lib/kind')
;

exports = O.init('test', 'kind');

// Public {{{1
throw O.log.todo();

exports.dprofile = true;

exports.addDdes();
exports.ddes.add('name', 'text', {required: true});
exports.ddes.add('email', 'text');

exports.schema.map({
  kind: 'test',
  field: 'name',
});

