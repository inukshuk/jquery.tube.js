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
    var state = $.isNumeric(event) ? event : (event && event.data);

     switch (state) {
       case -1:
         this.notify('unstarted');
         break;
       case 0:
         this.notify('end');
         break;
       case 1:
         this.notify('play');
         break;
       case 2:
         this.notify('pause');
         break;
       case 3:
         this.notify('buffer');
         break;
       case 5:
         this.notify('cue');
         break;

       default:
       // ignore
     }
  });

  // Register event handlers set in options
  $.each(Player.events, function (idx, event) {
    if (self.options.events[event]) {
      self.on(event, self.options.events[event]);
    }
  });
};

Player.create = function (options) {
  var dom, player;

  options = $.extend({}, Player.defaults, options);
  options.playerVars = $.extend(Player.parameters, options.playerVars || {});

  // Resolve player's id
  options.id = resolve_player_id(options.id);

  // copy 
  dom = $('#' + options.id);
  player = dom.data('player');

  if (!player) {
    player = new Player(options);
    dom.data('player', player);
  }

  return player;
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
  height: 390,
  wmode: 'opaque',
  events: {}
};

Player.parameters = {
  autohide: 2, // 0 = always visible, 1 = hide progress bar and controls, 2 = hide progress bar
  autoplay: 0,
  controls: 1,
  start: 0,
  enablejsapi: 1,
  loop: 0,
  modestbranding: 1
};

Player.callbacks = [];

Player.semaphore = 0;

Player.events = ['unstarted', 'end', 'play', 'cue', 'buffer', 'pause', 'error'];

/** Private Methods */

// Allow us to pass in CSS selectors and resolve the element's id
var resolve_player_id = function (id) {
  if ((/^#|\./).test(id)) {
    return $(id).attr('id') || id;
  }
  else {
    return id;
  }
};


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
    this.p.current_video = video;
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

Player.prototype.seek = function (to, seek_ahead) {
  if (this.p) {
    if (undefined === seek_ahead) {
      seek_ahead = true;
    }

    this.p.seekTo(to, seek_ahead);
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

/* Returns the current video or null */
Player.prototype.current_video = function (callback) {
  var video = this.p && this.p.current_video;

  if (video && !video.id) {
    // this.video is not a video object, so we assume it is a YouTube ID
    this.video = (new Video()).load(video, callback);
    return this.video;
  }

  if (typeof callback === 'function') {
    window.setTimeout(function () { callback.apply(video, [1, false, video]); }, 0);
  }
  return video;
};

/** API Dependent Methods */

// TODO change switch to improve testability

if (typeof window.postMessage === 'function') {

  // Use the iFrame API
  // https://code.google.com/apis/youtube/iframe_api_reference.html

  Player.api = 'iframe';
  Player.constants.api = 'https://www.youtube.com/player_api';


  Player.prototype.event_proxy_for = function (event) {
    return $.proxy(this.notify, this, event);
  };


  Player.load = function (callback) {
    if (typeof YT === 'undefined') {
      var tag = document.createElement('script');

      if (typeof callback === 'function') {
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

    if (typeof callback === 'function') {
      setTimeout(callback, 0);
    }

    return true;
  };

  Player.prototype.load = function (video) {
    var self = this, options = $.extend({}, this.options, { videoId: video.id || video, events: {} }),
      dom = $('#' + options.id);

    Player.load(function () {
      try {
        // Map YouTube native events to our own events
        $.each(Player.constants.events, function (key, value) {
          options.events[key] = self.event_proxy_for(value);
        });

        self.p = new YT.Player(options.id, options);

        // Save the current video
        if (video) {
          self.p.current_video = video;
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
  window.onYouTubeIframeAPIReady = function () {
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

  Player.parameters.autoplay = 1;

  // Workaround:
  // The JavaScript API can register event handlers only as strings. Therefore,
  // we need to set up a global proxy for each player instance.
  Player.prototype.event_proxy_for = function (event) {
    var self = this, id = this.options.id.replace(/[\s-]/g, '_'),
      proxy = ['event_proxy_for_player', id, event].join('_');

    window[proxy] = function () {
      var args = Array.prototype.slice.apply(arguments);

      args.unshift(event);
      self.notify.apply(self, args);
    };

    return proxy;
  };

  Player.load = function (callback) {
    if (typeof swfobject === 'undefined') {

      $.getScript(Player.constants.swfobject, function () {
        if (typeof callback === 'function') {
          callback.call();
        }
      });

      return false;
    }

    // Execute the callback (non-blocking)
    if (typeof callback === 'function') {
      setTimeout(callback, 0);
    }

    return true;
  };

  Player.prototype.load = function (video) {
    var self = this, options = $.extend({}, this.options, { videoId: video.id || video, events: {} }),
      dom = $('#' + options.id);

    Player.load(function () {
      try {
        Player.callbacks.push(function (id) {
          self.p = document.getElementById(id);

          // Register event proxies
          $.each(Player.constants.events, function (key, value) {
            self.p.addEventListener(key, self.event_proxy_for(value));
          });

          // Save the current video
          if (video) {
            self.p.current_video = video;
          }
        });

        swfobject.embedSWF(
          Player.constants.api.supplant({ video: options.videoId, id: options.id }),
          options.id,
          options.width,
          options.height,
          Player.constants.swf_version,
          null,
          options.playerVars,
          { allowScriptAccess: 'always', wmode: 'opaque' },
          { id: options.id }
        );
      }
      catch (error) {
        console.log('Failed to load YouTube player: ', error);
        // dom.append('Failed to load YouTube player: ' + error.toString());
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
