var expect = require('chai').expect;

var getCommentsPage = require('../lib/comment-pager.js')({videoID: 'eKEwL-10s7E'});

describe("Comment Pager", function(){
	it("should export a function", function(){
		expect(require('../lib/comment-pager.js')).to.be.a('function');
	});
	it("should return a function", function(){
		expect(getCommentsPage).to.be.a('function');
	});

	it("should throw an error if no video ID is provided", function(){
		//expect(require('../lib/comment-pager.js').to.throw(Error);
	});

	it("should accept a string as video ID", function(){
		expect(require('../lib/comment-pager.js')("eKEwL-10s7E")).to.be.a('function');
	});

	it("should give an error (500) for an invalid video ID", function(done){
		var getCommentsPage = require('../lib/comment-pager.js')( {videoID: "yadayada"} );

		getCommentsPage(null, function(error, page) {
			expect(error).to.exist;
			expect(page).not.to.exist;
			done();
		});
	});

	it("should get a comments page without a page token", function(done){
		this.timeout(10000);
		getCommentsPage(null, function(error, page){
			expect(error).not.to.exist;

			expect(page).to.have.a.property('comments').that.is.an('array');
			expect(page.comments).to.have.length.above(1);
			expect(page).to.have.a.property('nextPageToken').that.is.a('string');
			expect(page.nextPageToken).to.have.length.above(5);

			page.comments.forEach(function(c) {
				expect(c).to.have.a.property("id").that.is.a('string');
				expect(c).to.have.a.property("user").that.is.a('string');
				expect(c).to.have.a.property("date").that.is.a('string');
				expect(c).to.have.a.property("timestamp").that.is.a('number');
				expect(c).to.have.a.property("commentText").that.is.a('string');
				expect(c).to.have.a.property("likes").that.is.a('number');
				expect(c).to.have.a.property("hasReplies").that.is.a('boolean');

				if(c.hasReplies) {
					expect(c).to.have.a.property("replies").that.is.an('array');
					expect(c.replies).to.have.length.above(0);
				}
			});
				
			done();
		});
	});

	it("should get a different comments page with a page token", function(done){
		this.timeout(10000);
		getCommentsPage(null, function(error, page1){
			getCommentsPage(page1.nextPageToken, function(error, page2){
				expect(error).not.to.exist;

				expect(page1).to.not.deep.equal(page2);

				expect(page2).to.have.a.property('comments').that.is.an('array');
				expect(page2.comments).to.have.length.above(1);
				expect(page2).to.have.a.property('nextPageToken').that.is.a('string');
				expect(page2.nextPageToken).to.have.length.above(5);

				page2.comments.forEach(function(c) {
					expect(c).to.have.a.property("id").that.is.a('string');
					expect(c).to.have.a.property("user").that.is.a('string');
					expect(c).to.have.a.property("date").that.is.a('string');
					expect(c).to.have.a.property("timestamp").that.is.a('number');
					expect(c).to.have.a.property("commentText").that.is.a('string');
					expect(c).to.have.a.property("likes").that.is.a('number');
					expect(c).to.have.a.property("hasReplies").that.is.a('boolean');

					if(c.hasReplies) {
						expect(c).to.have.a.property("replies").that.is.an('array');
						expect(c.replies).to.have.length.above(0);
					}
				});
					
				done();
			});
		});
	});
});