
// methods exposed by jquery function plugin
var methods = {
  load: Player.load
};


// the jquery fn plugin
$.fn.tube = function (args) {
  var element, options;
  
  if (this.length) {
    
    if (typeof args === 'string') {
      options = { query: args };
    }
    else {
      options = args;
    }
    
		element = this.first();
		element.data('tube', new Tube(options).load(function (success) {
			element.html(this.render());
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
