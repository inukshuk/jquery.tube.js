/** Player Constructor */

var Player = function (options) {
  this.options = options;   
};

Player.ready = false;

Player.load = function (callback) {
  if (!Player.ready) {
    
    // register callback
    Player.callback = callback;
    
    var tag = document.createElement('script');
    tag.src = $.tube.constants.api;

    $('script:first').before(tag);

    return true;
  }
  
  return false;
};

if (exports) {
	exports.Player = Player;
}
