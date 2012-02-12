;(function ($, window, document, undefined) {
	
	$(function () {
		
	  $('#tube').tube({ player: 'player', query: 'ctbto', autoload: true, limit: 5, start: 3,
	    load: function () { console.log('on load', this); },
	    play: function () { console.log('on play', this); },
	    pause: function () { console.log('on pause', this); },
	    stop: function () { console.log('on stop', this); }
    });
	
	});
	
}(jQuery, this, this.document));
