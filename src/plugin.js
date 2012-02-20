
// The jQuery fn plugin for playlists/queries
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
      var tube = this, playlist;
      
      if (tube.options.render) {
        playlist = $(tube.render());

        // setup on-click handlers to play video
        $('a[rel]', playlist).click(function (event) {
          event.preventDefault();       
          tube.play($(this).attr('rel'));
        });

        element.append(playlist); 
      }
      
    }));
    
  }
  
  return this;
};

// The jQuery fn plugin for single player instances
$.fn.player = function (args) {
  var element, options, player;
  
  if (this.length) {
    
    if (typeof args === 'string') {
      options = $.extend({}, $.player.defaults, { video: args });
    }
    else {
      options = $.extend({}, $.player.defaults, args);
    }
    
    element = this.first();
    
    if (element.data('player')) {
      element.data.player.play(options.video);
    }
    else {
      
      // TODO generate id in case this element does not have one
      options.id = element.attr('id');
            
      if (options.video) {
        new Player(options).load(options.video);
      }      
    }
  }
  
  return this;
  
};

$.tube = {};

$.tube.constants = Tube.constants;
$.tube.defaults = Tube.defaults;

$.player = {};
$.player.defaults = Player.defaults;
