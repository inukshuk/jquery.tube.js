
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
	thumbnail: '<img src="{url}" width="{width}" height="{height}" title="{title}" />',
	title: '<h1>{title} ({duration})</h1>',
	author: '<a href="{url}">{name}</a>',
	description: '<p>{description}</p>',
	statistics: '<span class="statistics">{views} / {favorites}</span>',
	video: '{title}{thumbnail}{description}<p>{author} – {statistics}</p></div>'
};

/** Private Functions */


var pad = function (number) {
	return ('0' + number).slice(-2);
};


/** Instance Methods */

/** Parses a YouTube JSON element */
Video.prototype.parse = function (json) {
	try {
		if (json.id) {
			this.id = json.id.$t.match(/\/([^\/]*)$/)[1];
		}
	
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

			if (media.media$description) {
				this.description = media.media$description.$t;
			}
			
			if (media.yt$duration) {
				this.duration_in_seconds = parseInt(media.yt$duration.seconds, 10);
			}
			
			if (media.media$thumbnail && $.isArray(media.media$thumbnail)) {
				this.thumbnails = $.map(media.media$thumbnail, function (image) {
					return image; // width, height, url, time
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

/** Returns the video as an HTML string */
Video.prototype.html = function () {
	return Video.templates.video.supplant({
		title: Video.templates.title.supplant({ title: this.title, duration: this.duration() }),
		thumbnail: Video.templates.thumbnail.supplant(this.thumbnails[0]),
		description: Video.templates.description.supplant(this),
		author: Video.templates.author.supplant(this.author),
		statistics: Video.templates.statistics.supplant(this.statistics)
	});
};



if (exports) {
  exports.Video = Video;
}