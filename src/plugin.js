
/** String Supplant from Douglas Crockford's Remedial JavaScript */
if (!String.prototype.supplant) {
 String.prototype.supplant = function (o) {
   return this.replace(/\{([^{}]*)\}/g, function (a, b) {
     var r = o[b];
     return typeof r === 'string' || typeof r === 'number' ? r : a;
   });
 };
}

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
    
    tube = new Tube(options);
    tube.load();

		this.first().data('tube', tube);
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
