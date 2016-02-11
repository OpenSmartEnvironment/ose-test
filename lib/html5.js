'use strict';

const O = require('ose')(module);

var Wrap = O.getClass('ose-html5/lib/wrap');

var Assert = O.chai.assert;
var Equal = Assert.equal;

// Public {{{1
exports.find = function(el, sel, message) {  // {{{2
  if (! message) message = sel;

  var res = el.find(sel);

  Assert(Boolean(res), message);

  return res;
};

exports.html = function(el, sel, html, message) {  // {{{2
  if (! (el instanceof Wrap)) {
    el = el.ose || new Wrap(el);
  }

  switch (arguments.length) {
  case 2:
    html = sel;
    message = sel;
    sel = undefined;
    break
  case 3:
    message = html;
    html = sel;
    sel = undefined;
    break;
  case 4:
    el = exports.find(el, sel, message);
    break;
  default:
    throw O.log.error('INVALID_ARGS', arguments);
  }

  if (! message) message = html;

  Assert.equal(el.html(), html, message);

  return el;
};

exports.awaitView = function(view, cb) {  // {{{2
  if (arguments.length === 1) {
    cb = view;
    view = O.ui.body.main.content;
  }

  var fn = view._endUpdate;
  Assert(Boolean(fn), 'After display handler');

  view._endUpdate = function(err) {
    O.async.setImmediate(function() {
      cb(err);
    });

    return fn(err);
  }

  return view;
};

exports.list = function(el, sel, list, message) {  // {{{2
  if (! message) message = sel;

  var res = el.el.querySelectorAll(sel);

  switch (O.typeof(list)) {
  case 'null':
  case 'undefined':
    return res;
  case 'number':
    Equal(list, res.length, message + ' length');
    return res;
  case 'array':
    Equal(list.length, res.length, message + ' length');
    for (var i = 0; i < list.length; i++) {
      Equal(list[i], res[i].innerHTML, i + 'nth child');
    }
    return res;
  }

  throw O.log.error('INVALID_ARGS', arguments);
};

