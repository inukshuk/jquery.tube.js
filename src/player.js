/*
 * Player is a proxy for a YouTube player object. It will use YouTube's
 * iFrame API if available, or else fallback to the JavaScript API.
 */

var Player = function (options) {
  this.options = options;
	this.p = null;
};

// mixin observer pattern
observable.apply(Player.prototype);

Player.constants = {
	swfobject: '//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js'
};

Player.defaults = {
	id: 'player',
	quality: 'medium',
	width: 640,
	height: 360,
	autohide: 2, // 0 = always visible, 1 = hide progress bar and controls, 2 = hide progress bar
	autoplay: 0,
	controls: 1,
	loop: 0,
	theme: 'dark' // 'light'
};


/** Instance Methods */

Player.prototype.play = function (video) {
	if (!this.p) {
		return this.load(video);
	}

	if (video) {
		this.p.loadVideoById(video.id, 0, this.options.quality);		
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




Player.prototype.event_proxy_for = function (event) {
	return $.proxy(this.notify, this, event);
};

/** API Dependent Methods */

// TODO change switch to improve testability

if ($.isFunction(window.postMessage)) {

	// Use the iFrame API
	// https://code.google.com/apis/youtube/iframe_api_reference.html
	
	Player.api = 'iframe';
	Player.constants.api = '//www.youtube.com/player_api';
	
	Player.constants.events = {
		onReady: 'ready',
		onStateChange: 'state',
		onPlaybackQualityChange: 'quality',
		onError: 'error'
	};
	
	Player.load = function (callback) {
	  if (typeof YT === 'undefined') {
	    var tag = document.createElement('script');
		
			window.onYouTubePlayerAPIReady = function () {
				if ($.isFunction(callback)) {
					callback.call();
				}
			};

	    tag.src = Player.constants.api;
	    $('script:first').before(tag);

	    return false;
	  }
		
		if ($.isFunction(callback)) {
			setTimeout(callback, 0);
		}

	  return true;
	};
	
	Player.prototype.load = function (video) {
		var self = this, options = $.extend({}, this.options, { videoId: video.id });

		Player.load(function () {
			try {
				// map youtube events to our own events
				$.each(Player.constants.events, function (key, value) {
					options[key] = self.event_proxy_for(value);
				});

				self.p = new YT.Player(options.id, options);
			}
			catch (error) {
				console.log('Failed to load YouTube player: ', error);
			}
		});

		return this;
	};
}
else {
	
	// Use the JavaScript API
	// https://code.google.com/apis/youtube/js_api_reference.html
	// https://code.google.com/p/swfobject/
	
	Player.api = 'js';
	Player.constants.api = '//www.youtube.com/v/{video}?enablejsapi=1&playerapiid=ytplayer&version=3';
	
	Player.load = function (callback) {
		if (!swfobject) {
	    var tag = document.createElement('script');

			$(tag).load(function () {
				if ($.isFunction(callback)) {
					callback.call();
				}			
			});

	    tag.src = Player.constants.swfobject;
	    $('script:first').before(tag);
	
			return false;
		}
		
		if ($.isFunction(callback)) {
			setTimeout(callback, 0);
		}			

		return true;
	};
	
	Player.prototype.load = function (video) {
		return this;
	};
	
}



if (exports) {
	exports.Player = Player;
}