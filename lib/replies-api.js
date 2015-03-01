var xhrc = require('xmlhttprequest-cookie');
var XMLHttpRequest = xhrc.XMLHttpRequest;
var CookieJar = xhrc.CookieJar;

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

	function getCommentReplies(commentID, pageToken, callback) {
		if(!commentID) 
			return callback(new Error("No comment ID specified. Cannot get replies."));

		requestSessionToken(videoID, function(error, sessionToken) {
			if(error)
				return callback(error);

			params = {};
			params['session_token'] = sessionToken;
			params['video_id'] = videoID;
			params['comment_id'] = commentID;

			if(pageToken)
				params['page_token'] = pageToken;

			xhrPost(YT_AJAX_REPLY_URL, params, function(xhr){
				if(xhr.status != 200)
					return callback(new Error("Requesting replies failed. Status " + xhr.status));
				if(!xhr.responseText)
					return callback(new Error("No replies received from server. Status " + xhr.status));

				var repliesPageStr = xhr.responseText.toString().trim();
				var repliesPage;

				try {
					repliesPage = JSON.parse(cleanJSON(repliesPageStr));
				} catch(e) {
					return callback(new Error("Error parsing Server response: " + e));
				}
				
				var nextPageToken = repliesPage['page_token'];
				callback(null, repliesPage.html, nextPageToken);
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

/* XMLHttpRequest - POST */
var xhrPost = function(url, params, callback) {
	var xhr = new XMLHttpRequest();
	xhr.debug = false;

	xhr.open("POST", url, true);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			callback(xhr);
		}
	}

	var requestBody;
	if (params) {
		var bodyParam = [];
		for (var name in params) {
			bodyParam.push(name + '=' + encodeURIComponent(params[name]));
		}
		requestBody = bodyParam.join('&');
		if (requestBody) {
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"); 
		}
	}

	xhr.send(requestBody);
};