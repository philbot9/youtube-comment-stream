var expect = require('chai').expect;
var cheerio = require('cheerio');

var getReplies = require('../lib/replies-api.js')({videoID: 'eKEwL-10s7E'});

describe("Replies API", function(){
	it("should export a function", function(){
		expect(require('../lib/replies-api.js')).to.be.a('function');
	});
	
	it("should return a function", function(){
		expect(getReplies).to.be.a('function');
	});

	it("should throw an error if no video ID is provided", function(){
		expect(require('../lib/replies-api.js')).to.throw(Error);
		expect(function(){
			require('../lib/replies-api.js')();
		}).to.throw(Error);
		expect(function(){
			require('../lib/replies-api.js')({});
		}).to.throw(Error);
		expect(function(){
			require('../lib/replies-api.js')({yada: "yada"});
		}).to.throw(Error);
		expect(function(){
			require('../lib/replies-api.js')({videoID: ""});
		}).to.throw(Error);
		expect(function(){
			require('../lib/replies-api.js')("");
		}).to.throw(Error);
	});

	it("should accept a string as video ID", function(){
		expect(require('../lib/replies-api.js')("eKEwL-10s7E")).to.be.a('function');
	});

	it("should give an error (400) for an invalid video ID", function(done){
		this.timeout(10000);
		var getReplies = require('../lib/replies-api.js')( {videoID: "yadayada"} );

		getReplies("z13oy5eavyzketqp204cjvjadqu5xttiwhk", function(error, page) {
			expect(error).to.exist;
			expect(page).not.to.exist;
			expect(error).to.have.a.property('status', 400);
			done();
		});
	});

	it("should give an error (503) for an invalid comment ID", function(done){
		this.timeout(10000);

		getReplies("yadayada", function(error, page) {
			expect(error).to.exist;
			expect(page).not.to.exist;
			expect(error).to.have.a.property('status', 503);
			done();
		});
	});

	it("should get replies to a comment", function(done){
		this.timeout(10000);
		getReplies("z13oy5eavyzketqp204cjvjadqu5xttiwhk", function(error, page){
			expect(error).to.not.exist;
			
			expect(page).to.have.a.property('html');
			expect(page.html).to.be.a('string');
			expect(page.html).to.have.length.above(1);
			done();
		});
	});

	it("should return valid HTML for replies", function(done){
		this.timeout(10000);
		getReplies("z13oy5eavyzketqp204cjvjadqu5xttiwhk", function(error, page){
			var $ = cheerio.load(page.html);
			expect($(".comment-item")).to.have.a.property('0');
			done();
		});
	});
});