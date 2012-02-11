
/** Tube Constructor */

var Tube = function (options) {
  this.videos = [];
  this.options = $.extend({}, Tube.defaults, options);
	this.current = 0;
	this.player = new Player({ id: this.options.player });
};

observable.apply(Tube.prototype);

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
  version: 2,
  format: 5,
  limit: 10,
  key: false  
};

Tube.parameters = {
  'q': 'query',
  'max-results': 'limit',
  'key': 'key',
  'format': 'format',
  'orderby': 'order',
  'author': 'author',
  'version': 'v'
};


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
 * as an argument to this method, it will be called when the AJAX request
 * returns. The callback will be applied to the tube object and passed the
 * number of videos that were fetched (i.e., a zero value indicates failure
 * or no results).
 * 
 * Returns the tube object (non-blocking).
 */
Tube.prototype.load = function (callback) {
    var self = this, success = 0;

    $.getJSON(this.request(), function (data) {
      success = data.feed.entry.length;

      self.videos = $.map(data.feed.entry, function(item) {
        return new Video().parse(item);
      });
			
			
			// TODO check if player already exists for the DOM target and reuse it
			
			if (success && (self.options.autoload || self.options.autoplay)) {
				self.current = Math.min(self.videos.length - 1, self.options.start);
				self.player[self.options.autoplay ? 'play' : 'load'](self.videos[self.current]);
			}
			
      if (callback && $.isFunction(callback)) {  
        callback.apply(self, [success]);
      }
    });
    
    return this;
};

/** Returns the tube's gdata parameters as a hash */
Tube.prototype.parameters = function () {
  var self = this, parameters = {};
  
  $.each(Tube.parameters, function (key, value) {
    if (self.options[value]) {
      parameters[key] = self.options[value];
    }
  });
  
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
    api += 'playlists/' + this.options.playlist;
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
	}
	return this;
};

/** Plays the next video. */
Tube.prototype.next = function () {
	return this.advance(1);
};

/** Plays the previous video. */
Tube.prototype.previous = function () {
	return this.advance(-1);
};

Tube.prototype.advance = function (by) {	
	return this.play(this.current + (by || 1));
};



/** Returns the video as an HTML string */
Tube.prototype.html = function () {
	var elements = $.map(this.videos, function (video) {
		return '<li>' + video.html() + '</li>';
	});
	return '<ol>' + elements.join('') + '</ol>';
};


if (exports) {
  exports.Tube = Tube;
}