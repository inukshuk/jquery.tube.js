
/** Tube Constructor */

var Tube = function (options) {
  var self = this;

  this.videos = [];
  this.options = $.extend({}, Tube.defaults, options);
  this.current = 0;
  this.player = Player.create(this.player_options());

  this.options.templates = $.extend({}, Video.templates, this.options.templates || {});

  observable.apply(this);

  // Register Tube event handlers
  $.each(Tube.events, function (idx, event) {
    if (self.options.events[event]) {
      self.on(event, self.options.events[event]);
    }
  });

  // Register Player event proxies and handlers
  $.each(Player.events, function (idx, event) {

    self.player.on(event, $.proxy(self.notify, self, event));

    if (self.options.events[event]) {
      self.on(event, self.options.events[event]);
    }
  });

};

Tube.constants = {
  api: '//gdata.youtube.com/feeds/api/'
};

Tube.defaults = {
  player: 'player',
  autoload: false, // load the player automatically?
  autoplay: false,
  start: 0,
  order: 'relevance', // 'published', 'rating', 'viewCount'
  author: false,
  hide: 2, // 0 = always visible, 1 = hide progress bar and controls, 2 = hide progress bar
  controls: 1,
  version: 2,
  format: 5,
  limit: 10,
  key: false,
  render: true,
  truncate: false,
  at: '\n', // pattern (truncate)
  max: 140, // max length (truncate)
  omission: '…', // omission string (truncate)
  events: [],
  load: false, // plugin callback when the playlist data has been loaded
  complete: false, // plugin callback when the playlist html has been rendered
  click: false // plugin callback
};

Tube.parameters = {
  'q': 'query',
  'max-results': 'limit',
  'key': 'key',
  'format': 'format',
  'orderby': 'order',
  'author': 'author',
  'v': 'version'
};

Tube.events = ['load', 'ready', 'stop', 'error'];


/** Static Tube Functions */

/*
 * Encodes a set of parameters. Returns the encoded parameters as a string.
 */
Tube.serialize = function (parameters) {
  var string;

  switch (typeof parameters) {
    case 'string':
      string = encodeURI(parameters);
      break;

    case 'object':
      if (parameters === null) {
        string = '';
      }
      else {
        string = $.map(parameters, function (value, key) {
          if (value) {
            return [encodeURI(key), encodeURI(value)].join('=');
          }
        }).join('&');
      }
      break;

    default:
      string = '';
      break;
  }

  return string;
};



/** Tube Instance Methods */

/*
 * Populates the tube object with data from YouTube. If function is passed
 * as an argument to this method, it will be called when the AJAX request(s)
 * returns. The callback will be applied to the tube object and passed the
 * number of videos that were fetched (i.e., a zero value indicates failure
 * or no results).
 *
 * Returns the tube object (non-blocking).
 */
Tube.prototype.load = function (callback) {
    var self = this, success = 0, proxy;

    if (this.options.list && this.options.list.length) {

      // Custom lists

      // Proxy to be called after each Video.load
      proxy = function (status, error) {
        if (status === 0) {
          if (callback && $.isFunction(callback)) {
            callback.apply(self, [success, error]);
          }
          self.notify('error');
        }

        // Call the fallback only when all videos have loaded
        if (++success >= self.options.list.length) {
          self.notify('load');

          if (callback && $.isFunction(callback)) {
            callback.apply(self, [success]);
          }

          self.notify('ready');
        }
      };

      // Create video object for each element in the list and load it
      this.videos = $.map(this.options.list, function (id) {
        return (new Video()).load(id, proxy);
      });
    }
    else {

      // Regular YouTube queries

      $.getJSON(this.request(), function (data) {
        try {
          success = data.feed.entry.length;

          self.videos = $.map(data.feed.entry, function(item) {
            return new Video().parse(item);
          });

          if (success && (self.options.autoload || self.options.start)) {
            self.current = Math.min(self.videos.length - 1, Math.max(0, self.options.start - 1));
            self.player.load(self.videos[self.current]);
          }

          self.notify('load');

          if (callback && $.isFunction(callback)) {
            callback.apply(self, [success]);
          }

          self.notify('ready');
        }
        catch (error) {
          if (callback && $.isFunction(callback)) {
            callback.apply(self, [0, error]);
          }

          self.notify('error');
        }
      });
    }

    return this;
};

/** Returns the tube's player options as a hash */
Tube.prototype.player_options = function () {
  return {
    id: this.options.player,
    playerVars: $.extend({}, Player.parameters, {
      autoplay: this.options.autoplay,
      autohide: this.options.hide,
      controls: this.options.controls
    })
  };
};

/** Returns the tube's gdata parameters as a hash */
Tube.prototype.parameters = function () {
  var self = this, parameters = {};

  $.each(Tube.parameters, function (key, value) {
    if (self.options[value]) {
      parameters[key] = self.options[value];
    }
  });

  // adapt playlist specific parameters
  if (this.options.playlist) {
    delete parameters.orderby;
  }
  else if (this.options.user) {
    parameters.orderby = 'published';
  }

  parameters.alt      = 'json-in-script';
  parameters.callback = '?';

  return parameters;
};

/** Returns the tube's gdata request string */
Tube.prototype.request = function (options) {
  var api = Tube.constants.api;

  $.extend(this.options, options || {});

  // distinguish between playlist selection and video query
  if (this.options.playlist) {
    api += 'playlists/' + this.options.playlist.replace(/^PL/, '');
  }
  else if (this.options.user) {
    api += ['users', this.options.user, 'uploads'].join('/');
  }
  else {
    api += 'videos';
  }

  return [api, '?', Tube.serialize(this.parameters())].join('');
};

Tube.prototype.authenticate = function () {
  return this;
};

/*
 * Plays the video at the given index in the associated player.
 * If no index is given, resumes the current video.
 */
Tube.prototype.play = function (index) {
  if ($.isNumeric(index)) {
    var k = index % this.videos.length;
    this.current = (k < 0) ? this.videos.length - k : k;

    if (this.player && this.videos.length) {
      this.player.play(this.videos[this.current]);
    }
  }
  else {
    this.player.resume();
  }

  return this;
};

/** Pauses playback of the current player */
Tube.prototype.pause = function (index) {
  if (this.player) {
    this.player.pause();
  }
  return this;
};

Tube.prototype.stop = function (index) {
  if (this.player) {
    this.player.stop();
    this.notify('stop');
  }
  return this;
};

/** Plays the next video. */
Tube.prototype.next = function () {
  return this.advance(1).notify('next');
};

/** Plays the previous video. */
Tube.prototype.previous = function () {
  return this.advance(-1).notify('previous');
};

Tube.prototype.advance = function (by) {
  return this.play(this.current + (by || 1));
};

Tube.prototype.render_options = function (options) {
  return $.extend({}, Video.defaults, this.options, options || {});
};

/** Returns the video as an HTML string */
Tube.prototype.render = function () {
  var templates = this.options.templates, options = this.render_options();
  var elements = $.map(this.videos, function (video, index) {
    options.index = index;
    return '<li>' + video.render(templates, options) + '</li>';
  });

  return '<ol>' + elements.join('') + '</ol>';
};


if (exports) {
  exports.Tube = Tube;
}