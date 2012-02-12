;(function ($, window, document, undefined) {
	
	var event_handler = function (event) {
	  console.log('on ' + event, this);
	};
	
	$(function () {
		
	  $('#tube').tube({ player: 'player', query: 'ctbto', autoload: true, limit: 5, start: 3,
	    load: event_handler, play: event_handler, pause: event_handler, stop: event_handler
    });
	
	});
	
}(jQuery, this, this.document));
