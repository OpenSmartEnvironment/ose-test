'use strict';

const O = require('ose')(module)
  .singleton('../lib/suite')
;

exports = O.init('test/test/browser');

var Html5 = require('ose-test/lib/html5');
var Find = Html5.find;
var List = Html5.list;
var Html = Html5.html;

var Assert = O.chai.assert;
var Equal = Assert.equal;

// Tests {{{1
exports.add('Dashboard', function(cb) {  // {{{2
  return O.ui.body.display({main: {view: 'dashboard'}}, 'user', function(err) {
    if (err) return cb(err);

    var d = Find(O.ui.body.main, 'ul');
    Html(d.header, 'Dashboard');
    var items = List(d, 'li>div>h3', ['Aliases', 'Kinds']);

    return O.async.nextTick(function() {
      items[0].click();
      exports.view = Html5.awaitView(cb);
    });

    /*
      // Display list by clicking on "Aliases"


      var list = Find(O.ui.body.main, 'gaia-list');
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

  Html5.awaitView(cb);
  /*

  var list = Find(O.ui.body.main, 'gaia-list');
  var fn = list.doAfterDisplay;
  Assert(Boolean(fn), 'After display handler');

  exports.view = list;

  return cb();
  */
});

