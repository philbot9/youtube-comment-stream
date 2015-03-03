var xhr = require('./xhr-helper.js');

var requestSessionToken = require('./youtube-session.js');

var YT_AJAX_REPLY_URL = "https://www.youtube.com/comment_ajax?action_load_replies=1&order_by_time=True&tab=inbox";

module.exports = function(options) {
	var videoID;
	/* make sure no one's trying to screw with us... */
	if(!options) 
		return console.error("replies-api: No video ID specified.");
	if(typeof options === 'object') {
		if(!options.videoID)
			return console.error("replies-api: No video ID specified.");
		videoID = options.videoID;
	} else if(typeof options === 'string') {
		videoID = options;
	} else {
		return console.error("replies-api: No video ID specified.");
	}

	return getCommentReplies;

	function getCommentReplies(commentID, callback) {
		if(!commentID)
			return callback(new Error("No comment ID specified. Cannot get replies."));

		requestSessionToken(videoID, function(error, sessionToken) {
			if(error)
				return callback(error);

			params = {};
			params['session_token'] = sessionToken;
			params['video_id'] = videoID;
			params['comment_id'] = commentID;

			xhr.post(YT_AJAX_REPLY_URL, params, function(res){
				if(res.status != 200)
					return callback(new Error("Requesting replies failed. Status " + res.status));
				if(!res.responseText)
					return callback(new Error("No replies received from server. Status " + res.status));

				var repliesPageStr = res.responseText.toString().trim();
				var repliesPage;

				try {
					repliesPage = JSON.parse(cleanJSON(repliesPageStr));
				} catch(e) {
					return callback(new Error("Error parsing Server response: " + e));
				}
				
				callback(null, {html: repliesPage.html});
			});
		});
	}
}

/* clear any invalid escape sequences in a JSON string */
var cleanJSON = function(str) {
	/* 
	 * Sometimes Youtube uses '\U' which should be '\u'. So try to replace any invalid 
	 * escape sequences with their lowercase versions first.
	 */
	var re = /(\\[^"\/bfnrtu\\])/g;
	return str.replace(re, function(m) {
		if(!re.test(m.toLowerCase()))
			return m.toLowerCase();
		else
			return "";
	});
};
