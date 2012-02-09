
// methods exposed by jquery function plugin
var methods = {
  load: Player.load,
  ready: Player.ready,
};


// the jquery fn plugin
$.fn.tube = function (args) {
  var tube, options;
  
  if (this.length) {
    
    if (typeof args === 'string') {
      options = { query: args };
    }
    else {
      options = args;
    }
    
		var self = this.first();
		self.data('tube', new Tube(options).load(function (success) {
			self.html(this.html());
		}));
  }
  
  return this;
};

// a jquery function plugin
$.tube = function (command) {
  var fn = methods[command];
  return $.isFunction(fn) ? fn.call() : fn;
};

$.tube.constants = Tube.constants;
$.tube.defaults = Tube.defaults;

window.onYouTubePlayerAPIReady = function () {
  Player.ready = true;
  console.log('player API loaded');
};
