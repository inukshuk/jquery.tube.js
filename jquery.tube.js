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
  this.statistics = {};
  this.thumbnails = [];
  
  if (properties) {
   $.extend(this, properties);
  }
 };
 
 Video.constants = {
  users: '//www.youtube.com/user/{name}'
 };
 
 Video.templates = {
  thumbnail: '<img src="{url}" width="{width}" height="{height}" title="{title}" />',
  title: '<h1>{title} ({duration})</h1>',
  author: '<a href="{url}">{name}</a>',
  description: '<p>{description}</p>',
  statistics: '<span class="statistics">{views} / {favorites}</span>',
  video: '{title}{thumbnail}{description}<p>{author} – {statistics}</p></div>'
 };
 
 /** Private Functions */
 
 
 var pad = function (number) {
  return ('0' + number).slice(-2);
 };
 
 
 /** Instance Methods */
 
 /** Parses a YouTube JSON element */
 Video.prototype.parse = function (json) {
  try {
   if (json.id) {
    this.id = json.id.$t.match(/\/([^\/]*)$/)[1];
   }
  
   if (json.author && $.isArray(json.author)) {
    this.author = { 
     name: json.author[0].name.$t,
     id: json.author[0].uri.$t.match(/\/([^\/]*)$/)[1]
    };
    this.author.url = Video.constants.users.supplant(this.author);
   }
   
   if (json.yt$statistics) {
    this.statistics.favorites = json.yt$statistics.favoriteCount;
    this.statistics.views = json.yt$statistics.viewCount;
   }
 
   if (json.title) {
    this.title = json.title.$t;
   }
   
   if (json.media$group) {
    var media = json.media$group;
 
    if (media.media$description) {
     this.description = media.media$description.$t;
    }
    
    if (media.yt$duration) {
     this.duration_in_seconds = parseInt(media.yt$duration.seconds, 10);
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
  return (this.duration_in_seconds || 0) % 60;
 };
 
 Video.prototype.minutes = function () {
  return parseInt((this.duration_in_seconds || 0) / 60, 10) % 60;
 };
 
 Video.prototype.hours = function () {
  return parseInt((this.duration_in_seconds || 0) / 3600, 10);
 };
 
 /** Returns the duration as a formatted string */
 Video.prototype.duration = function () {
  if (!this.duration_in_seconds) {
   return '';
  }
  
  var h = this.hours(), m = this.minutes(), s = this.seconds();
  return (h ? [h, pad(m), pad(s)] : [m, pad(s)]).join(':');
 };
 
 /** Returns the video as an HTML string */
 Video.prototype.html = function () {
  return Video.templates.video.supplant({
   title: Video.templates.title.supplant({ title: this.title, duration: this.duration() }),
   thumbnail: Video.templates.thumbnail.supplant(this.thumbnails[0]),
   description: Video.templates.description.supplant(this),
   author: Video.templates.author.supplant(this.author),
   statistics: Video.templates.statistics.supplant(this.statistics)
  });
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
  return '<ol>' + elements.join('') + '</ol>';
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
     
   var self = this.first();
   self.data('tube', new Tube(options).load(function (success) {
    self.html(this.html());
   }));
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
