
/** Video Constructor */

var Video = function (properties) {
	this.authors = [];
	this.statistics = {};
	
	if (properties) {
		$.extend(this, properties);
	}
};

Video.constants = {};

/** Perses a YouTube JSON element */
Video.prototype.parse = function (json) {
	try {
		if (json.id) {
			this.id = json.id.$t.match(/\/([^\/]*)$/)[1];
		}
	
		if (json.author && $.isArray(json.author)) {
			this.authors = $.map(json.author, function (author) {
				return { name: author.name.$t, uri: author.uri.$t };
			});
		}
		
		if (json.yt$statistics) {
			this.statistics.favorites = json.yt$statistics.favoriteCount;
			this.statistics.views = json.yt$statistics.viewCount;
		}

		if (json.title) {
			this.title = json.title.$t;
		}
		
		if (json.description) {
			this.description = json.media$group.media$description.$t;
		}
		
		if (json.media$group) {
			var media = json.media$group;
			
			if (media.yt$duration) {
				this.duration = parseInt(media.yt$duration.seconds, 10);
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
	return this.duration || 0;
};


/** Returns the video as an HTML string */
Video.prototype.html = function () {
	return '';
};



if (exports) {
  exports.Video = Video;
}