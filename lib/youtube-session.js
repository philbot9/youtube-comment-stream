var xhr = require('./xhr-helper.js');
/* 
 * IMPORTANT:
 * Youtube expects a session token AND a Cookie with each ajax request. The regular
 * XMLHttpRequest does not send cookies, so I used the xmlhttprequest-cookie module.
 * Not sure what exactly that Cookie contains and there is no authentication needed to 
 * get it. It is just added to the repsonse when requesting the comment website 
 * (YT_COMMENTS_URL).
 */

module.exports = initializeSession;

var YT_COMMENTS_URL = "https://www.youtube.com/all_comments?v=";
var sessionToken;

function initializeSession(videoID, callback) {
	if(sessionToken)
		return callback(null, sessionToken);

	xhr.get(YT_COMMENTS_URL + videoID, function(res){
		if(res.status != 200) 
			return callback(new Error("Unable to retrieve video page. Status " + res.status));
		
		var re = /\'XSRF_TOKEN\'\s*\n*:\s*\n*"(.*)"/;
		var m = re.exec(res.responseText.toString());

		if(!m)
			return callback(new Error("Unable to find session token"));
		if(m.length <= 1)
			return callback(new Error("Unable to find session token"));
		if(xhr.CookieJar.cookieList.length == 0)
			return callback(new Error("No cookie received"));
		/* The xhr module holds on to the cookie itself. No need to pass it around. */

		sessionToken = m[1],

		callback(null, sessionToken);
	});
}
