describe('$.fn.player', function () {
  'use strict';

  it('is a function', function () {
    $.isFunction($.fn.player).should.be.true;
  });

  it('can be called as a jquery plugin', function () {
    var o = $('<div/>');
    o.player().should.equal(o);
  });

  it('generates id if necessary', function () {
    $('<div/>').player().attr('id').should.match(/jquery-tube-player-\d/);
  });

});
