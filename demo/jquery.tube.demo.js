;(function ($, window, document, undefined) {
	
	var event_handler = function (event) {
	  console.log('on ' + event, this);
	};
	
	$(function () {
		
		$('#player-1').player({ video: 'A6t9Vn7-9eU', events: { end: event_handler, play: event_handler, pause: event_handler } });
		
	  $('#tube-1').tube({ player: 'player-2', user: 'CTBTO', thumbnail: 0, autoplay: true, limit: 5, start: 3, controls: 1, hide: 1,
	    events: { load: event_handler, play: event_handler, pause: event_handler,
	    stop: event_handler, end: event_handler, ready: event_handler }, truncate: true,
	    templates: { description: '<p>Description:</p><p>{description}</p>' }
    });

    $('#tube-2').tube({ player: 'player-2', playlist: 'PL6EAA9FF571B3BFEE', autoplay: true, limit: 3,
      events: { load: event_handler, play: event_handler, pause: event_handler,
      stop: event_handler, end: event_handler, ready: event_handler }
    });

    $('#tube-3').tube({ player: 'player-1', query: 'nuclear testing', autoplay: true, limit: 3,
      events: { load: event_handler, play: event_handler, pause: event_handler,
      stop: event_handler, end: event_handler, ready: event_handler }
    });

	
	});
	
}(jQuery, this, this.document));
