;(function ($, window, document, undefined) {
	
	var event_handler = function (event) {
	  console.log('on ' + event, this);
	};
	
	$(function () {
		
		$('#player-1').player('A6t9Vn7-9eU');
		
	  $('#tube-1').tube({ player: 'player-2', query: 'ctbto', autoplay: true, limit: 5, start: 3, controls: 1, hide: 1,
	    events: { load: event_handler, play: event_handler, pause: event_handler,
	    stop: event_handler, end: event_handler, ready: event_handler }, truncate: true,
	    templates: { description: '<p>Description:</p><p>{description}</p>' }
    });

    $('#tube-2').tube({ player: 'player-2', query: 'united nations', autoplay: true, limit: 3,
      events: { load: event_handler, play: event_handler, pause: event_handler,
      stop: event_handler, end: event_handler, ready: event_handler }
    });

    $('#tube-3').tube({ player: 'player-1', query: 'nuclear testing', autoplay: true, limit: 3,
      events: { load: event_handler, play: event_handler, pause: event_handler,
      stop: event_handler, end: event_handler, ready: event_handler }
    });

	
	});
	
}(jQuery, this, this.document));
