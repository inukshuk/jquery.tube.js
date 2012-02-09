
/** Tube Constructor */

var Tube = function (options) {
  this.videos = [];
  this.options = $.extend({}, Tube.defaults, options);
};


Tube.constants = {
  api: '//gdata.youtube.com/feeds/api/' 
};

Tube.defaults = {
  player: '#player',
  order: 'published',
  author: false,
  version: 2,
  format: 5,
  limit: false,
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


/** Tube Methods */


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
        return {
          title: item.title.$t,
          description: item.media$group.media$description.$t,
          id: item.id.$t.replace('http://gdata.youtube.com/feeds/api/videos/','')
        };
        
      });

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
  
};

/** Returns the video as an HTML string */
Tube.prototype.html = function () {
	var elements = $.map(this.videos, function (video) {
		return '<li>' + video.html() + '</li>';
	});
	return '<ul>' + elements.join('') + '</ul>';
};


if (exports) {
  exports.Tube = Tube;
}