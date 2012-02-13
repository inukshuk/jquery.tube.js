;(function ($, window, document, undefined) {
	
	var event_handler = function (event) {
	  console.log('on ' + event, this);
	};
	
	$(function () {
		
	  $('#tube').tube({ player: 'player', query: 'ctbto', autoplay: true, limit: 5, start: 3, controls: 1, hide: 1,
	    events: { load: event_handler, play: event_handler, pause: event_handler,
	    stop: event_handler, end: event_handler, ready: event_handler },
	    templates: { description: '<p>Description:</p><p>{description}</p>' }
    });
	
	});
	
}(jQuery, this, this.document));
