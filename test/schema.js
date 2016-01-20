'use strict';

const O = require('ose')(module)
  .singleton('ose-level')
;

exports = O.init('test');

require('./kind');
