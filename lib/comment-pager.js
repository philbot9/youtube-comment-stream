var parseComments = require('./comment-parser.js');

module.exports = function(options) {
	var videoID;
	/* make sure no one's trying to screw with us... */
	if(!options) 
		return console.error("comment-pager: No video ID specified.");
	if(typeof options === 'object') {
		if(!options.videoID)
			return console.error("comment-pager: No video ID specified.");
		videoID = options.videoID;
	} else if(typeof options === 'string') {
		videoID = options;
	} else {
		return console.error("comment-pager: No video ID specified.");
	}

	var getCommentsPage = require('./comment-api.js')({"videoID": videoID});

	return function(pageToken, callback) {
		//console.log("--Requesting Comment Page " + pageToken);
		getCommentsPage(pageToken, function(error, pageContent, nextPageToken) {
			if(error)
				return callback(error);

			//console.log("--Parsing Comment Page");
			parseComments(pageContent, videoID, function(error, commentsArr) {
				if(error)
					return callback(error);

				callback(null, commentsArr, nextPageToken);
			});
		});
	};
}
