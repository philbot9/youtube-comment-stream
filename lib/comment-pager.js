var async = require('async');
var parseComments = require('./comment-parser.js');

module.exports = function(options) {
	var videoID;
	var options = options || {};
	if(typeof options === 'string')
		videoID = options;
	else if(options.videoID)
		videoID = options.videoID;
	else
		return new Error("comment-pager: No video ID specified.");

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
				if(!comment.hasReplies)
					return callback(null, comment);

				getCommentReplies(comment.id, function(error, response){
					if(error) {
						if(error.status == 503) {
							console.error("Comment has no replies: " + comment.id);
							comment.hasReplies = false;
							return callback(null, comment);
						} else {
							return callback(error);
						}
					}
					comment.replies = parseComments(response.html, {includeReplies: true}).comments;
					callback(null, comment);
				});
			};

			var asyncCallback = function(error, commentsAndReplies) {
				if(error)
					return cb(error);
				page.comments = commentsAndReplies;
				cb(null, page);
			};

			async.map(page.comments, 
				asyncIterator.bind(this),
				asyncCallback.bind(this));
		});
	};
}
