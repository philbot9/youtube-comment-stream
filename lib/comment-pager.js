var async = require('async');
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
	var getCommentReplies = require('./replies-api.js')({"videoID": videoID});

	return function(pageToken, cb) {
		getCommentsPage(pageToken, function(error, response) {
			if(error)
				return cb(error);

			var page = {
				comments: parseComments(response.html).comments,
				nextPageToken: response.nextPageToken
			};

			var asyncIterator = function(comment, callback) {
				if(comment.hasReplies) {
					getCommentReplies(comment.id, function(error, response){
						if(error) {
							return callback(error);
						}

						comment.replies = parseComments(response.html, {includeReplies: true}).comments;						
						callback();
					});
				} else {
					callback();
				}
			};

			var asyncCallback = function(error) {
				if(error)
					console.error("Error getting replies: " + error);
				cb(null, page);
			};

			async.each(page.comments, 
				asyncIterator.bind(this),
				asyncCallback.bind(this));
		});
	};
}
