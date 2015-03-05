var parseComments = require('./lib/comment-parser.js');
var Readable = require('stream').Readable;

module.exports = makeStream;

function makeStream(videoID) {
	if(!videoID)
		return console.error(new Error("comment-streamer: No video ID specified"));

	var loadCommentsPage = require('./lib/comment-pager.js')({"videoID": videoID});
	var rStream = new Readable();

	var comments;
	var prevComments;
	var nextPageToken = null;

	var getNextPage = function() {
		loadCommentsPage(nextPageToken, function(error, page) {
			if(error) 
				rStream.emit('error', error);
			if(!page.comments)
				return;

			deleteOverlap(prevComments, page.comments);

			if(!comments)
				comments = [];
			
			page.comments.forEach(function(comment) {
				comments.push(comment);
			});

			prevComments = page.comments;
			nextPageToken = page.nextPageToken;

			rStream.push(JSON.stringify(comments.shift()) + "\n");
		});
	};

	rStream._read = function(size) {
		if(!comments)
			return getNextPage();

		if(comments.length) {
			rStream.push(JSON.stringify(comments.shift()) + "\n");
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
