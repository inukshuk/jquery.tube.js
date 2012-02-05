/*!
 * jquery.tube.js
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

/** String Supplant from Douglas Crockford's Remedial JavaScript */
if (!String.prototype.supplant) {
 String.prototype.supplant = function (o) {
   return this.replace(/\{([^{}]*)\}/g, function (a, b) {
     var r = o[b];
     return typeof r === 'string' || typeof r === 'number' ? r : a;
   });
 };
}

(function ($, window, document, version, undefined) {
  "use strict";  

  
  /** Tube Constructor */
  
  var Tube = function (options) {
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

  // methods exposed by jquery function plugin
  var methods = {
    load: Player.load,
    
    ready: Player.ready,
    
    version: version
  };


  // the jquery fn plugin
  $.fn.tube = function (args) {
    var playlist, options;
    
    if (this.length) {
      
      if (typeof args === 'string') {
        options = { query: args };
      }
      else {
        options = args;
      }
      
      playlist = new Tube(options);
      playlist.load();
    }
    
    return this;
  };
  
  // a jquery function plugin
  $.tube = function (command) {
    var fn = methods[command];
    return $.isFunction(fn) ? fn.call() : fn;
  };
  

  $.tube.constants = {
    gdata: {
      api: 'http://gdata.youtube.com/feeds/api/videos',
      map: {
        'q': 'query',
        'max-results': 'limit',
        'key': 'key',
        'format': 'format',
        'orderby': 'order'
      }
    },
    player: {
      api: 'http://www.youtube.com/player_api'
    }
  };
  
  $.tube.defaults = {
    player: '#player',
    order: 'published',
    format: 5,
    limit: false,
    key: false
  };
  
  window.onYouTubePlayerAPIReady = function () {
    Player.ready = true;
    console.log('player API loaded');
  };

  // export classes for testing
  $.tube.Tube = Tube;
  $.tube.Player = Player;
  
}(jQuery, window, window.document, '0.1'));
