var parseComments = require('./lib/comment-parser.js');
var EventEmitter = require("events").EventEmitter;
var Readable = require('stream').Readable;

module.exports = makeStream;

function makeStream(videoID) {
	if(!videoID)
		return console.error(new Error("comment-streamer: No video ID specified"));

	var loadCommentsPage = require('./lib/comment-pager.js')({"videoID": videoID});
	var rStream = new Readable( {objectMode: true} );

	var commentsJSON;
	var prevComments;
	var nextPageToken = null;

	var getNextPage = function() {
		loadCommentsPage(nextPageToken, function(error, page) {
			if(error) 
				rStream.emit('error', error);
			if(!page.comments)
				return;

			deleteOverlap(prevComments, page.comments);

			if(!commentsJSON)
				commentsJSON = [];
			
			page.comments.forEach(function(comment) {
				commentsJSON.push(JSON.stringify(comment));
			});

			prevComments = page.comments;
			nextPageToken = page.nextPageToken;

			rStream.push(commentsJSON.shift());
		});
	};

	rStream._read = function(size) {
		if(!commentsJSON)
			return getNextPage();

		if(commentsJSON.length) {
			this.push(commentsJSON.shift());
		} else if(nextPageToken) {
			return getNextPage();
		} else {
			this.push(null);
		}
	};

	return rStream;
};

/* Sometimes the last comment on one page is the same as the first comment on the
 * next page. It's definitely Youtube's fault!
 * This function gets rid of the extra comments on the second page */
function deleteOverlap(firstPage, secondPage) {
	if(!firstPage || !secondPage)
		return;
	for(var i = firstPage.length-1; i >= 0; i--) {
		if(commentsEqual(firstPage[i], secondPage[0]))
			secondPage.splice(0, 1);
		else
			break;	
	}
}

/* What makes two comments equal? */
function commentsEqual(c1, c2) {
	return c1.id === c2.id;
}
