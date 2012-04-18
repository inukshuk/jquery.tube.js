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

if (exports) {
  exports.Video = Video;
}