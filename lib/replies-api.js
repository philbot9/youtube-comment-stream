var xhr = require('./xhr-helper.js');

var requestSessionToken = require('./youtube-session.js');

var YT_AJAX_REPLY_URL = "https://www.youtube.com/comment_ajax?action_load_replies=1&order_by_time=True&tab=inbox";

module.exports = function(options) {
	var videoID;
	var options = options || {};
	if(typeof options === 'string')
		videoID = options;
	else if(options.videoID)
		videoID = options.videoID;
	else
		throw new Error("No video ID specified.");

	return function(commentID, callback) {
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
				if(!res)
					return callback(new Error("Requesting replies utterly failed."));
				if(res.status != 200) {
					var e = new Error("Requesting comments page failed.");
					e.status = res.status;
					return callback(e);
				}

				var repliesStr = res.responseText.toString().trim();
				var replies;

				try {
					replies = JSON.parse(cleanJSON(repliesStr));
				} catch(e) {
					return callback(new Error("Error parsing Server response: " + e));
				}

				callback(null, {html: replies.html});
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
	var re = /[^\\](\\[^"\/\\bfnrtu])/g;
	return str.replace(re, function(m) {
		if(!re.test(m.toLowerCase()))
			return (m[0] + m.substring(1).toLowerCase());
		else
			return (m[0] + "");
	});
};
