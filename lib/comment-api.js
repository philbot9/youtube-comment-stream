var xhr = require('./xhr-helper.js');

var requestSessionToken = require('./youtube-session.js');

var YT_AJAX_URL = "https://www.youtube.com/comment_ajax?action_load_comments=1&order_by_time=True&filter=";

module.exports = function(options) {
	var videoID;
	/* make sure no one's trying to screw with us... */
	if(!options) 
		return console.error("comment-api: No video ID specified.");
	if(typeof options === 'object') {
		if(!options.videoID)
			return console.error("comment-api: No video ID specified.");
		videoID = options.videoID;
	} else if(typeof options === 'string') {
		videoID = options;
	} else {
		return console.error("comment-api: No video ID specified.");
	}

	return getCommentsPage;

	function getCommentsPage(pageToken, callback) {
		requestSessionToken(videoID, function(error, sessionToken) {
			if(error)
				return callback(error);

			var params = {};
			params['session_token'] = sessionToken;

			if(!pageToken) 
				params['video_id'] = videoID; /* get the first comment page */
			else
				params['page_token'] = pageToken; /* get a specific comment page */

			xhr.post(YT_AJAX_URL + videoID, params, function(res) {
				if(res.status != 200)
					return callback(new Error("Requesting comments page failed.\n" + res));
				if(!res.responseText)
					return callback(new Error("No comments received from server.\n" + res));

				var commentsPage = {};
				try {
					var commentPageStr = res.responseText.toString().trim();
					commentsPage = JSON.parse(cleanJSON(commentPageStr));
				} catch(e) {
					return callback(new Error("Error parsing Server response: " + e));
				}

				callback(null, {
					html: commentsPage.html, 
					nextPageToken: commentsPage['page_token']
				});
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
