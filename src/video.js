
/** Video Constructor */

var Video = function (json) {
	this.id = json.id.$t.match(/(\/[^\/]*)$/)[1];

	this.title = json.title.$t;
	this.description = json.media$group.media$description.$t;
	this.thumbnails = $.map(json.media$group.media$thumbnails, function (thumb) {
		if (thumb.url) {
			return thumb.url;
		}
	});	
};

Video.constants = {};

/** Returns the video as an HTML string */
Video.prototype.html = function () {
	
};

if (exports) {
  exports.Video = Video;
}