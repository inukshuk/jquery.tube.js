
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

			if (success) {
	      if (tube.options.render) {
	        playlist = $(tube.render());

	        // setup on-click handlers to play video
	        $('a[rel]', playlist).click(function (event) {
						if ($.isFunction(tube.options.click)) {
							tube.options.click.apply(tube, ['click', this, event]);
						}
	          tube.play($(this).attr('rel'));
	        });

					if ($.isFunction(tube.options.load)) {
						tube.options.load.apply(tube, ['load', playlist, element]);
					}
				
	        element.append(playlist); 
	
	      }
	
				if ($.isFunction(tube.options.complete)) {
					tube.options.complete.apply(tube, ['complete', playlist, element]);
				}
	
			}
			else {
				if ($.isFunction(tube.options.complete)) {
					tube.options.complete.apply(tube, ['error', playlist, element]);
				}
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
        Player.create(options).load(options.video);
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
