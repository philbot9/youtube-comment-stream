var EventEmitter = require("events").EventEmitter;
var cheerio = require('cheerio');

module.exports = function(html, options) {
	if(!html)
		throw new Error("No comment code provided.");
	if(!html.length)
		throw new Error("No comment code provided.");

	options = options || {};

	var comments = [];
	var $ = cheerio.load(html, {normalizeWhitespace: true});

	/* Select all comment-item divs and loop over them */
	$(".comment-item").each(function(index) {
		if($(this).hasClass("reply") && !options.includeReplies)
			return;

		comment = {};

		comment.id = $(this).attr('data-cid').toString(),
		comment.user = $(this)
				.children(".content")
				.children("div .comment-header")
				.children(".user-name")
				.text();
		comment.date = $(this)
				.children(".content")
				.children("div .comment-header")
				.children(".time")
				.text().trim();
		comment.timestamp = convertYtDate(comment.date);
		comment.commentText = $(this)
                .children(".content")
                .children("div .comment-text")
                .children("div .comment-text-content")
                .text();
		var likes = $(this)
				.children(".content")
				.children("div .comment-footer")
				.children("div .comment-footer-actions")
				.children(".like-count.on").text();
		comment.likes = parseInt(likes) - 1;
		
		/* only check if this comment has replies, if this comment is not a reply itself */
		if(!$(this).hasClass("reply")) {
			if($(this).next().text().length > 1)
				comment.hasReplies = true;
			else
				comment.hasReplies = false;
		}

		comments.push(comment);
	});

	return {comments: comments};
};

function convertYtDate(ytDate) {
	var re = /(\d+)\s(\w+)\sago/;
	var m = re.exec(ytDate);

	if(!m)
		return null;

	if(m.length <= 1)
		return null;

	var num = parseInt(m[1]);
	var type = m[2];

	var date = new Date();

	if(type === "minute" || type === "minutes") {
		date.setMinutes(date.getMinutes() - num);
	}
	else if(type === "day" || type === "days") {
		date.setDate(date.getDate() - num);
	}
	else if(type === "week" || type === "weeks") {
		date.setDate(date.getDate() - (num * 7));
	}
	else if(type === "month" || type === "months") {
		date.setMonth(date.getMonth() - num);
	}  
	else if(type === "year" || type === "years") {
		date.setFullYear(date.getFullYear() - num);
	}

	return date.getTime();
}
