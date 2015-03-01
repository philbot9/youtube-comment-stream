var xhrc = require('xmlhttprequest-cookie');
var XMLHttpRequest = xhrc.XMLHttpRequest;
var CookieJar = xhrc.CookieJar;

/* 
 * IMPORTANT:
 * Youtube expects a session token AND a Cookie with each ajax request. The regular
 * XMLHttpRequest does not send cookies, so I used the xmlhttprequest-cookie module.
 * Not sure what exactly that Cookie contains and there is no authentication needed to 
 * get it. It is just added to the repsonfse when requesting the comment website 
 * (YT_COMMENTS_URL).
 */

module.exports = initializeSession;

var YT_COMMENTS_URL = "https://www.youtube.com/all_comments?v=";
var sessionToken;

function initializeSession(videoID, callback) {
	if(sessionToken)
		return callback(null, sessionToken);

	xhrGet(YT_COMMENTS_URL + videoID, function(xhr){
		if(xhr.status != 200) 
			return callback(new Error("Unable to retrieve video page. Status " + xhr.status));
		
		var re = /\'XSRF_TOKEN\'\s*\n*:\s*\n*"(.*)"/;
		var m = re.exec(xhr.responseText.toString());

		if(!m)
			return callback(new Error("Unable to find session token"));
		if(m.length <= 1)
			return callback(new Error("Unable to find session token"));
		if(CookieJar.cookieList.length == 0)
			return callback(new Error("No cookie received"));
		/* The xhr module holds on to the cookie itself. No need to pass it around. */

		sessionToken = m[1],

		callback(null, sessionToken);
	});
}

/* XMLHttpRequest - GET */
var xhrGet = function (url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.debug = false;

	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			callback(xhr);
		}
	};
	xhr.open("GET", url);
	xhr.send();
};