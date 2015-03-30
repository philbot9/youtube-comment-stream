var async = require('async');
var parseComments = require('./comment-parser.js');

var REQUEST_RETRIES = 5;

module.exports = function(options) {
	var videoID;
	var options = options || {};
	if(typeof options === 'string')
		videoID = options;
	else if(options.videoID)
		videoID = options.videoID;
	else
		throw new Error("comment-pager: No video ID specified.");

	var getCommentsPage = require('./comment-api.js')({"videoID": videoID});
	var getCommentReplies = require('./replies-api.js')({"videoID": videoID});

	return function(pageToken, cb) {
		var commentsRetries = REQUEST_RETRIES;

		var commentsPageCB = function(error, response) {
			if(error) {
				if(commentsRetries-- > 0) {
					console.log("Error retrieving comments page: [STATUS " + error.status + "]. Retrying..."); 
					return getCommentsPage(pageToken, commentsPageCB);
				} else {
					return cb(error);
				}
			}
			commentsRetries = REQUEST_RETRIES;

			var page = {
				comments: parseComments(response.html).comments,
				nextPageToken: response.nextPageToken
			};

			var asyncIterator = function(comment, callback) {
				if(!comment.hasReplies)
					return callback(null, comment);
				
				var repliesRetries = REQUEST_RETRIES;

				var commentRepliesCB = function(error, response) {
					if(error) {
						if(repliesRetries-- > 0) {
							console.log("Error retrieving replies [STATUS " + error.status + "]. Retrying..."); 
							return getCommentReplies(comment.id, commentRepliesCB);
						} else {
							return callback(error);
						}
					}
					repliesRetries = REQUEST_RETRIES;
					comment.replies = parseComments(response.html, {includeReplies: true}).comments;
					callback(null, comment);
				};

				getCommentReplies(comment.id, commentRepliesCB);
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

		};

		getCommentsPage(pageToken, commentsPageCB);
	};
}
