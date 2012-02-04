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

;(function ($, window, document, version, undefined) {
  "use strict";
  

  var Playlist = function (options) {
    this.options = options;
  };
  
	Playlist.prototype.load = function (query) {
		var self = this;
		
		var parameters = [
			'q=' + (query || self.options.query),
			'alt=json-in-script',
			'max-results=' + self.options.limit,
			'orderby=' + self.options.order,
			'format=' + self.options.format,
			'callback=?'
		];
		
		var request = $.tube.constants.gdata + '?';
		request += parameters.join('&');
		
		$.getJSON(request, function (data) {
			console.log(data);
		});
	};
	
	
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
        options = $.tube.defaults;
        options.query = args;
      }
      else {
        options = $.extend({}, $.tube.defaults, options);
      }
      
      playlist = new Playlist(options);
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
    gdata: 'http://gdata.youtube.com/feeds/api/videos',
    api: 'http://www.youtube.com/player_api'
  };
  
  $.tube.defaults = {
    player: '#player',
    order: 'published',
    format: 5,
    limit: false
  };
  
  window.onYouTubePlayerAPIReady = function () {
    Player.ready = true;
		console.log('player API loaded');
  };

}(jQuery, this, this.document, '0.1'));
