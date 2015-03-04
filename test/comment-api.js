var expect = require('chai').expect;

var cheerio = require('cheerio');
var getCommentsPage = require('../lib/comment-api.js')({videoID: 'eKEwL-10s7E'});

describe("Comment API", function(){
	it("should export a function", function(){
		expect(require('../lib/comment-api.js')).to.be.a('function');
	});
	
	it("should return a function", function(){
		expect(getCommentsPage).to.be.a('function');
	});

	it("should return an error if no video ID is provided", function(){
		expect(require('../lib/comment-api.js')()).to.be.instanceof(Error);
	});

	it("should give an error (500) for an invalid video ID", function(done){
		this.timeout(10000);
		var getCommentsPage = require('../lib/comment-api.js')( {videoID: "yadayada"} );

		getCommentsPage(null, function(error, page) {
			expect(error).to.exist;
			expect(page).not.to.exist;
			expect(error).to.have.a.property('status', 500);
			done();
		});
	});

	it("should accept a string as video ID", function(){
		expect(require('../lib/comment-api.js')("eKEwL-10s7E")).to.be.a('function');
	});
	
	it("should get a comments page without a page token", function(done){
		this.timeout(10000);
		getCommentsPage(null, function(error, page){
			expect(error).to.not.exist;
			
			expect(page).to.have.a.property('html');
			expect(page.html).to.be.a('string');
			expect(page.html).to.have.length.above(1);

			expect(page).to.have.a.property('nextPageToken');
			expect(page.nextPageToken).to.be.a('string');
			expect(page.nextPageToken).to.have.length.above(1);
			done();
		});
	});
	
	it("should get a different comments page with a page token", function(done){
		this.timeout(10000);
		getCommentsPage(null, function(error, page1){
			getCommentsPage(page1.nextPageToken, function(error, page2){
				expect(error).to.not.exist;
			
				expect(page1.html).to.not.equal(page2.html);
				expect(page1.nextPageToken).to.not.equal(page2.nextPageToken);

				expect(page1).to.have.a.property('html');
				expect(page1.html).to.be.a('string');
				expect(page1.html).to.have.length.above(1);

				done();
			});	
		});
	});

	it("should return valid HTML for comments", function(done){
		this.timeout(10000);
		getCommentsPage(null, function(error, page){
			var $ = cheerio.load(page.html);
			expect($(".comment-item")).to.have.a.property('0');
			done();
		});

	});
});