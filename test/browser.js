'use strict';

var O = require('ose').object(module, '../lib/suite');
exports = O.init('test/test/browser');

var Gaia = require('ose-test/lib/gaia');
var Find = Gaia.find;
var List = Gaia.list;
var Html = Gaia.html;

var Assert = O.chai.assert;
var Equal = Assert.equal;

// Tests {{{1
exports.add('Dashboard', function(cb) {  // {{{2
  return O.ui.display({content: {view: 'dashboard'}}, function(err) {
    if (err) return cb(err);

    var d = Find(O.ui.main, 'gaia-list');
    Html(d.header, 'Dashboard');
    var items = List(d, 'li>div>h3', ['Aliases', 'Kinds']);

    return O.async.nextTick(function() {
      items[0].click();
      exports.view = Gaia.awaitView(cb);
    });

    /*
      // Display list by clicking on "Aliases"


      var list = Find(O.ui.main, 'gaia-list');
      var fn = list.doAfterDisplay;
      Assert(Boolean(fn), 'After display handler');

      exports.view = list;

      list.doAfterDisplay = function(err) {
        fn(err);
        return cb(err);
      }

    });
    */
  });
});

exports.add('List aliases', function(cb) {  // {{{2
  var items = List(exports.view, 'li', 3);
  items[0].click();

  Gaia.awaitView(cb);
  /*

  var list = Find(O.ui.main, 'gaia-list');
  var fn = list.doAfterDisplay;
  Assert(Boolean(fn), 'After display handler');

  exports.view = list;

  return cb();
  */
});

