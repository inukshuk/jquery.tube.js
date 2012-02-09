
/** Tube Constructor */

var Tube = function (options) {
  this.videos = [];
  this.options = $.extend({}, $.tube.defaults, options);
};

/** Static Tube Functions */

/*
 * Encodes a set of parameters.
 * Returns the encoded parameters as a string.
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
 * returns. The callback will be applied to the tube object.
 * 
 * Returns the tube object (non-blocking).
 */
Tube.prototype.load = function (callback) {
    var self = this;
    $.getJSON(this.request(), function (data) {
  if (callback && $.isFunction(callback)) {
      $.each(data.feed.entry, function(ii, item) {
	  self.videos[ii] = {};
	  self.videos[ii].title = item['title']['$t'];
	  self.videos[ii].description = item['media$group']['media$description']['$t'];
	  var video = item['id']['$t'];
	  self.videos[ii].videoId = video.replace('http://gdata.youtube.com/feeds/api/videos/','');  //extracting the videoID
	  self.videos[ii].thumb = "http://img.youtube.com/vi/{videoId}/default.jpg".supplant({videoId: self.videos[ii].videoId});
      });
  
            callback.apply(self);
  }
    });
    
    return this;
};

/** Returns the tube's gdata parameters as a hash */
Tube.prototype.parameters = function (options) {
  var parameters = {};
  options = $.extend(options || {}, this.options);
  
  $.each($.tube.constants.gdata.map, function (key, value) {
    if (options[value]) {
      parameters[key] = options[value];
    }
  });
  
  parameters.alt      = 'json-in-script';
  parameters.callback = '?';

  return parameters;
};

/** Returns the tube's gdata request string */
Tube.prototype.request = function (options) {
  return [$.tube.constants.gdata.api, '?', Tube.serialize(this.parameters(options))].join('');
};

if (exports) {
	exports.Tube = Tube;
};

