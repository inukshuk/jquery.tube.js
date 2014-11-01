;(function ($, window, document, undefined) {
	var timeout;

	var event_handler = function (event) {
	  console.log('on ' + event, this);
	};

	var start = function (event) {
	  var player = this.p;

	  timeout = setInterval(function () {
	    console.log('current time: ', player.getCurrentTime());
	  }, 50);
	};

	var stop = function (event) {
	  clearInterval(timeout);
	};

	$(function () {

		$('#player-1').player({ video: 'MHHw-kEEGUo', playerVars: { start: 50 }, events: { end: stop, play: start, pause: stop } });

    // $('#tube-1').tube({ player: 'player-2', user: 'CTBTO', thumbnail: 'hqdefault', autoplay: true, limit: 5, start: 3, controls: 1, hide: 1,
    //   events: { load: event_handler, play: event_handler, pause: event_handler,
    //   stop: event_handler, end: event_handler, ready: event_handler }, truncate: true,
    //   templates: { description: '<p>Description:</p><p>{description}</p>' }
    //     });
    //
    //     $('#tube-2').tube({ player: 'player-2', playlist: 'PL6EAA9FF571B3BFEE', autoplay: true, limit: 3,
    //       events: { load: event_handler, play: event_handler, pause: event_handler,
    //       stop: event_handler, end: event_handler, ready: event_handler }
    //     });
    //
    //     $('#tube-3').tube({ player: 'player-1', query: 'nuclear testing', limit: 3,
    //       events: { load: event_handler, play: event_handler, pause: event_handler,
    //       stop: event_handler, end: event_handler, ready: event_handler }
    //     });

    $('#tube-4').tube({ player: 'player-1', list: ['lVQ1EKR1v1I', 'ylLzyHk54Z0', 'sOEAD-gfJ_M'],
      events: { load: event_handler, play: event_handler, pause: event_handler,
      stop: event_handler, end: event_handler, ready: event_handler }
    });


	});

}(jQuery, this, this.document));
