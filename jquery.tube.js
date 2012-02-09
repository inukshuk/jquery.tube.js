/*!
 * jquery.tube.js 0.0.1
 * Copyright (c) 2012 Sylvester Keil, Thomas Egger.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
 
(function ($, window, document, version, undefined) {
  'use strict';
 
 /** Video Constructor */
 
 var Video = function (properties) {
  this.authors = [];
  this.statistics = {};
  
  if (properties) {
   $.extend(this, properties);
  }
 };
 
 Video.constants = {};
 
 /** Perses a YouTube JSON element */
 Video.prototype.parse = function (json) {
  try {
   if (json.id) {
    this.id = json.id.$t.match(/\/([^\/]*)$/)[1];
   }
  
   if (json.author && $.isArray(json.author)) {
    this.authors = $.map(json.author, function (author) {
     return { name: author.name.$t, uri: author.uri.$t };
    });
   }
   
   if (json.yt$statistics) {
    this.statistics.favorites = json.yt$statistics.favoriteCount;
    this.statistics.views = json.yt$statistics.viewCount;
   }
 
   if (json.title) {
    this.title = json.title.$t;
   }
   
   if (json.description) {
    this.description = json.media$group.media$description.$t;
   }
   
   if (json.media$group) {
    var media = json.media$group;
    
    if (media.yt$duration) {
     this.duration = parseInt(media.yt$duration.seconds, 10);
    }
    
    if (media.media$thumbnail && $.isArray(media.media$thumbnail)) {
     this.thumbnails = $.map(media.media$thumbnail, function (image) {
      return image; // width, height, url, time
     });
    } 
   }
  }
  catch (error) {
   console.log(error);
  }
  
  return this;
 };
 
 Video.prototype.seconds = function () {
  return this.duration || 0;
 };
 
 
 /** Returns the video as an HTML string */
 Video.prototype.html = function () {
  return '';
 };
 
 
 
 
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
         return new Video().parse(item);
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
   return this;
 };
 
 /** Returns the video as an HTML string */
 Tube.prototype.html = function () {
  var elements = $.map(this.videos, function (video) {
   return '<li>' + video.html() + '</li>';
  });
  return '<ul>' + elements.join('') + '</ul>';
 };
 
 
 /** Player Constructor */
 
 var Player = function (options) {
   this.options = options;   
 };
 
 Player.ready = false;
 
 Player.load = function (callback) {
   if (!Player.ready) {
     
     // register callback
     Player.callback = callback;
     
     var tag = document.createElement('script');
     tag.src = $.tube.constants.api;
 
     $('script:first').before(tag);
 
     return true;
   }
   
   return false;
 };
 
 
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
}(jQuery, window, window.document, '0.0.1'));
