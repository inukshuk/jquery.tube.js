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
  
  /** String Supplant from Douglas Crockford's Remedial JavaScript */
  if (!String.prototype.supplant) {
   String.prototype.supplant = function (o) {
     return this.replace(/\{([^{}]*)\}/g, function (a, b) {
       var r = o[b];
       return typeof r === 'string' || typeof r === 'number' ? r : a;
     });
   };
  }
  
  /** Array Remove - By John Resig (MIT Licensed) */
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };
  
  
  /** A Simple Observer Pattern Implementation */
  
  var observable = function (observers) {
    
    // private observer list
    observers = observers || {};
    
    this.on = function (event, callback) {
      observers[event] = observers[event] || [];
    
      if ($.isFunction(callback)) {
        observers[event].push(callback);      
      }
    
      return this;
    };
    
    // registers a one-time event handler
    this.once = function (event, callback) {
      var self = this;
      
      return this.on(event, function () {
        self.off(event, callback);
        callback.apply(self, arguments);
      });
    };
    
    this.off = function (event, callback) {
      if (observers[event]) {
        var i, os = observers[event], matches = [];
      
        if (callback) {
          for (i = 0; i < os.length; ++i) {
            if (os[i] === callback) {
              matches.push(i);
            }
          }
        
          for (i = 0; i < matches; ++i) {
            os.remove(i);
          }
        
        }
        else {
          // remove all observers for the event
          observers[event] = [];
        }      
      }
    
      return this;
    };
    
    this.notify = function () {
      var self = this, args = Array.prototype.slice.apply(arguments), event = arguments[0];
      
      if (observers[event]) {
        $.each(observers[event], function () {
          if ($.isFunction(this)) {
            this.apply(self, args);
          }
        });
      }
    
      return this;
    };
    
    return this;
  };
  
  /*global $: true, exports: true, console: true */
  
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
    thumbnail: '<img src="{url}" title="{title}" />',
    title: '<h1>{title} ({duration})</h1>',
    author: '<a href="{author_url}">{author}</a>',
    description: '<p>{description}</p>',
    statistics: '<span class="statistics">{views} / {favorites} / {uploaded}</span>',
    video: '<a href="#{id}" rel="{index}">{title}{thumbnail}{description}<p>{author} – {statistics}</p></a>'
  };
  
  Video.defaults = {
    truncate: false,
    at: '\n',
    max: 140,
    omission: '…',
    thumbnail: 'mqdefault', // index or name
    index: 0
  };
  
  /** Private Functions */
  
  var truncate = function (text, options) {
    var offset = text.length, index;
  
    if (options.at && (index = text.indexOf(options.at)) >= 0) {
      offset = Math.min(offset, index);
    }
  
    if (options.max) {
      if (options.omission && offset - options.omission.length > options.max) {
        return text.slice(0, options.max - options.omission.length) + options.omission;
      }
      else {
        return text.slice(0, Math.min(options.max, offset));
      }
    }
  
    return text.slice(0, offset);
  };
  
  var pad = function (num) { return ('0' + num).slice(-2); };
  
  var format_date = function (date) {
    if (date === null) { return ''; }
    
    if (typeof date !== 'object') {
      return date;
    }
    
    return [date.getDate(), date.getMonth(), date.getFullYear()].join('.');
  };
  
  /** Video Instance Methods */
  
  /** Parses a YouTube JSON element */
  Video.prototype.parse = function (json) {
    var self = this;
    
    try {
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
  
        // Overrides json.id
        if (media.yt$videoid) {
          this.id = media.yt$videoid.$t;
        }
  
        if (media.media$description) {
          this.description = media.media$description.$t;
        }
  
        if (media.yt$duration) {
          this.duration_in_seconds = parseInt(media.yt$duration.seconds, 10);
        }
  
        if (media.yt$uploaded) {
          try {
            this.uploaded = new Date(Date.parse(media.yt$uploaded.$t) ||
              // IE workaround
              Date.parse(media.yt$uploaded.$t.replace(/-/g, '/').replace(/T.*/, '')));
          }
          catch (error) {
            // ignore
          }
  
        }
  
        if (media.media$thumbnail && $.isArray(media.media$thumbnail)) {
          this.thumbnails = $.map(media.media$thumbnail, function (image) {
            return {
              width: image.width, height: image.height, url: image.url, name: image.yt$name
            };
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
  
  /** Returns the image as a property hash (used by the templates) */
  Video.prototype.properties = function (options) {
    if (typeof options.thumbnail === 'string') {
      var index = 0;
      
      $.each(this.thumbnails, function (i) {
        if (this.name === options.thumbnail) {
          index = i;
          return false;
        }
      });
      
      options.thumbnail = index;
    }
    
    return {
      id: this.id,
      index: options.index,
      title: this.title,
      duration: this.duration(),
      description: options.truncate ? truncate(this.description, options) : this.description,
      author: this.author.name,
      author_url: this.author.url,
      views: this.statistics.views,
      favorites: this.statistics.favorites,
      uploaded: format_date(this.uploaded),
      url: this.thumbnails[options.thumbnail].url
    };
  };
  
  /** Returns the video as an HTML string */
  Video.prototype.render = function (templates, options) {
    var properties = this.properties($.extend({}, Video.defaults, options));
    templates = templates || Video.templates;
  
    return templates.video.supplant({
      id: this.id,
      index: options.index,
      title: Video.templates.title.supplant(properties),
      thumbnail: Video.templates.thumbnail.supplant(properties),
      description: Video.templates.description.supplant(properties),
      author: Video.templates.author.supplant(properties),
      statistics: Video.templates.statistics.supplant(properties)
    });
  };
  
  
  /** Tube Constructor */
  
  var Tube = function (options) {
    var self = this;
  
    this.videos = [];
    this.options = $.extend({}, Tube.defaults, options);
    this.current = 0;
    this.player = new Player(this.player_options());
  
    this.options.templates = $.extend(Video.templates, this.options.templates || {});
  
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
      
      return this;
  };
  
  /** Returns the tube's player options as a hash */
  Tube.prototype.player_options = function () {
    return {
      id: this.options.player,
      playerVars: $.extend({
        autoplay: this.options.autoplay,
        autohide: this.options.hide,
        controls: this.options.controls
      }, Player.defaults)
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
  
  
  /*
   * Player is a proxy for a YouTube player object. It will use YouTube's
   * iFrame API if available, or else fallback to the JavaScript API.
   */
  
  var Player = function (options) {
    var self = this;
  
    this.options = $.extend({}, Player.defaults, options);
    this.p = null;
  
    // Resolve player's id
    this.options.id = resolve_player_id(this.options.id);
    
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
    height: 390,
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
  
  
  /** API Dependent Methods */
  
  // TODO change switch to improve testability
  
  if ($.isFunction(window.postMessage) && !$.browser.msie) {
  
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
          if ($.isFunction(callback)) {
            callback.call();
          }
        });
      
        return false;
      }
    
      // Execute the callback (non-blocking)
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
  
            Player.callbacks.push(function (id) {
              self.p = document.getElementById(id);
  
              // Register event proxies
              $.each(Player.constants.events, function (key, value) {
                self.p.addEventListener(key, self.event_proxy_for(value));  
              });
  
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
              { allowScriptAccess: 'always', wmode: 'opaque' },
              { id: options.id }
            );
  
          }
          
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
        element.data('player').play(options.video);
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
}(jQuery, window, window.document, '0.0.1'));
