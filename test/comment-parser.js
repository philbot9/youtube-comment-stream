var expect = require('chai').expect;
var fs = require('fs');

var parseComments = require('../lib/comment-parser.js');

describe("Comment Parser", function(){
	it("should export a function", function(){
		expect(parseComments).to.be.a('function');
	});

	it("should parse comments", function(){
		var html = fs.readFileSync("./test/exampleCommentsHTML");
		var commentsPage = parseComments(html);

		expect(commentsPage).to.have.a.property('comments').that.is.an('array');
		expect(commentsPage.comments).to.have.length(39);

		commentsPage.comments.forEach(function(c){
			expect(c).to.have.a.property("id").that.is.a('string');
			expect(c).to.have.a.property("user").that.is.a('string');
			expect(c).to.have.a.property("date").that.is.a('string');
			expect(c).to.have.a.property("timestamp").that.is.a('number');
			expect(c).to.have.a.property("commentText").that.is.a('string');
			expect(c).to.have.a.property("likes").that.is.a('number');
			expect(c).to.have.a.property("hasReplies").that.is.a('boolean');	
		});
	});

	it("should parse replies", function(){
		var html = fs.readFileSync("./test/exampleRepliesHTML");
		var commentsPage = parseComments(html, {includeReplies: true});

		expect(commentsPage).to.have.a.property('comments').that.is.an('array');
		expect(commentsPage.comments).to.have.length(9);

		commentsPage.comments.forEach(function(c){
			expect(c).to.have.a.property("id").that.is.a('string');
			expect(c).to.have.a.property("user").that.is.a('string');
			expect(c).to.have.a.property("date").that.is.a('string');
			expect(c).to.have.a.property("timestamp").that.is.a('number');
			expect(c).to.have.a.property("commentText").that.is.a('string');
			expect(c).to.have.a.property("likes").that.is.a('number');
			expect(c).not.to.have.a.property("hasReplies").that.is.a('boolean');	
		});
	});
});