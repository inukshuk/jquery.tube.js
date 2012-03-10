/*
 * Player is a proxy for a YouTube player object. It will use YouTube's
 * iFrame API if available, or else fallback to the JavaScript API.
 */

var Player = function (options) {
  var self = this;
  
  this.options = $.extend({}, Player.defaults, options);
  this.p = null;

  // Mix-in observer pattern
  observable.apply(this);

  // Handle YouTube's state change events and dispatch using our taxonomy
  this.on('state', function (name, event) {
    if (event) {
      switch (event.data) {
        case -1:
          this.notify('unstarted');
          break;
        case YT.PlayerState.ENDED:
          this.notify('end');
          break;
        case YT.PlayerState.PLAYING:
          this.notify('play');
          break;
        case YT.PlayerState.PAUSED:
          this.notify('pause');
          break;
        case YT.PlayerState.BUFFERING:
          this.notify('buffer');
          break;
        case YT.PlayerState.CUED:
          this.notify('cue');
          break;

        default:
        // ignore
      }
    }
  });
  
	// Register event handlers set in options
	$.each(Player.events, function (idx, event) {
	  if (self.options.events[event]) {
      self.on(event, self.options.events[event]);
    }
	});

  // Store the player reference on load (for reuse)
  this.once('ready', function (event) {
    $('#' + self.options.id).data('player', self);
  });
  
};

Player.constants = {
  swfobject: '//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js'
};

Player.constants.events = {
  onReady: 'ready',
  onStateChange: 'state',
  onPlaybackQualityChange: 'quality',
  onError: 'error'
};


Player.defaults = {
  id: 'player',
  width: 640,
  height: 360,
  wmode: 'opaque',
	events: {},
  playerVars: {
    autohide: 2, // 0 = always visible, 1 = hide progress bar and controls, 2 = hide progress bar
    autoplay: 0,
    controls: 1,
    enablejsapi: 1,
    loop: 0,
    modestbranding: 1
  }
};

Player.callbacks = [];

Player.semaphore = 0;

Player.events = ['unstarted', 'end', 'play', 'cue', 'buffer', 'pause', 'error'];

/** Instance Methods */

/*
 * Plays-back the passed-in video. The parameter can either be a YouTube
 * video id or a video object. If no video is given, the currently loaded
 * video will be played-back.
 */
Player.prototype.play = function (video) {
  if (!this.p) {
    return this.load(video);
  }

  if (video) {    
    this.p.loadVideoById(video.id || video, 0, this.options.quality);    
  }
  else {
    this.p.playVideo();
  }
  
  return this;
};

Player.prototype.resume = function () {
  if (this.p) {
    this.p.playVideo();
  }
  return this;
};

Player.prototype.pause = function () {
  if (this.p) {
    this.p.pauseVideo();
  }
  return this;
};

Player.prototype.stop = function () {
  if (this.p) {
    this.p.stopVideo();
  }
  return this;
};

Player.prototype.clear = function () {
  if (this.p) {
    this.p.stopVideo();
    this.p.clearVideo();
  }
  return this;
};




Player.prototype.event_proxy_for = function (event) {
  return $.proxy(this.notify, this, event);
};

/** API Dependent Methods */

// TODO change switch to improve testability

if ($.isFunction(window.postMessage) && !$.browser.msie) {

  // Use the iFrame API
  // https://code.google.com/apis/youtube/iframe_api_reference.html
  
  Player.api = 'iframe';
  Player.constants.api = '//www.youtube.com/player_api';
  
  Player.load = function (callback) {
    if (typeof YT === 'undefined') {			
      var tag = document.createElement('script');
    
      if ($.isFunction(callback)) {
        Player.callbacks.push(callback);
      }

			// Use semaphore to make sure we load the API just once
			if (Player.semaphore === 0) {
				Player.semaphore = 1;
				
	      tag.src = Player.constants.api;
	      $('script:first').before(tag);				
			}

      return false;
    }
    
    if ($.isFunction(callback)) {
      setTimeout(callback, 0);
    }

    return true;
  };
  
  Player.prototype.load = function (video) {
    var self = this, options = $.extend({}, this.options, { videoId: video.id || video, events: {} }),
      dom = $('#' + options.id);

    Player.load(function () {
      try {
        
        // Check whether or not a Player instance already exists
        if (dom.data('player')) {
          
          // Extract the player reference
          self.p = dom.data('player').p;
        
          // Register event proxies
          $.each(Player.constants.events, function (key, value) {
            self.p.addEventListener(key, self.event_proxy_for(value));
          });
          
          // If load was called with a video, play the video right away.
					// Make sure we actually have both video and p to prohibit cricular
					// call.
          if (video && self.p) {
            self.play(video);
          }
        }
        else {
          // Map YouTube native events to our own events
          $.each(Player.constants.events, function (key, value) {
            options.events[key] = self.event_proxy_for(value);
          });

          self.p = new YT.Player(options.id, options);

          // Store a player reference
          dom.data('player', self);
        }
        
      }
      catch (error) {
        // console.log('Failed to load YouTube player: ', error);
        dom.append('Failed to load YouTube player: ' + error.toString());
      }
    });

    return this;
  };

	// YouTube API's initial callback
	window.onYouTubePlayerAPIReady = function () {
	  $.each(Player.callbacks, function () {
	    this.call();
	  });
	};

}
else {
  
  // Use the JavaScript API
  // https://code.google.com/apis/youtube/js_api_reference.html
  // https://code.google.com/p/swfobject/
  
  Player.api = 'js';
  Player.constants.api = '//www.youtube.com/v/{video}?enablejsapi=1&playerapiid={id}&version=3';
  Player.constants.swf_version = '8';


  Player.load = function (callback) {
    if (typeof swfobject === 'undefined') {
      var tag = document.createElement('script');

      $(tag).load(function () {
        if ($.isFunction(callback)) {
          callback.call();
        }     
      });

      tag.src = Player.constants.swfobject;
      $('script:first').before(tag);
  
      return false;
    }
    
    if ($.isFunction(callback)) {
      setTimeout(callback, 0);
    }     

    return true;
  };
    
  
  Player.prototype.load = function (video) {
    var self = this, options = $.extend({}, this.options, { videoId: video.id || video, events: {} }),
			dom = $('#' + options.id);

    Player.load(function () {
      try {
        
        // Check whether or not a Player instance already exists
        if (dom.data('player')) {
          
          // Extract the player reference
          self.p = dom.data('player').p;
        
          // Register event proxies
          $.each(Player.constants.events, function (key, value) {
            self.p.addEventListener(key, self.event_proxy_for(value));
          });
          
          // If load was called with a video, play the video right away.
					// Make sure we actually have both video and p to prohibit cricular
					// call.
          if (video && self.p) {
            self.play(video);
          }
        }
        else {
          // Map YouTube native events to our own events
          $.each(Player.constants.events, function (key, value) {
            options.events[key] = self.event_proxy_for(value);
          });

	        Player.callbacks.push(function (id) {
						self.p = document.getElementById(id);

	          // Store a player reference
	          dom.data('player', self);
					});

					swfobject.embedSWF(
						Player.constants.api.supplant({ video: options.videoId, id: options.id }),
						options.id,
						options.width,
						options.height,
						Player.constants.swf_version,
						null,
						options.playerVars,
						{ allowScriptAccess: 'always' },
						{ id: options.id }
					);

        }
        
      }
      catch (error) {
        // console.log('Failed to load YouTube player: ', error);
        dom.append('Failed to load YouTube player: ' + error.toString());
      }
    });

    return this;
  };

	window.onYouTubePlayerReady = function () {
		var args = arguments;
		
		$.each(Player.callbacks, function () {
			this.apply(window, args);
		});
	};

}


if (exports) {
  exports.Player = Player;
}