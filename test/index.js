var expect = require('chai').expect;
var Readable = require('stream').Readable;
var JSONStream = require('json-stream');

var commentStreamer = require('../index.js');

describe("Youtube Comment Streamer", function(){
	it("should export a function", function(){
		expect(commentStreamer).to.be.a('function');
	});
	it("should return a Readable Stream", function(){
		expect(commentStreamer('nKTlRN3jLfw')).to.be.instanceof(Readable);
	});

	it("should stream raw data", function(done){
		this.timeout(10000);
		
		var commentStream = commentStreamer('nKTlRN3jLfw')
		commentStream.on('data', function(chunk){
			expect(chunk).to.exist;
			expect(chunk).to.be.instanceof(Buffer);
		});
		commentStream.on('end', function(){
			done();
		});
	});


	it("should stream comments in JSON format", function(done){
		this.timeout(10000);
		
		var jsonStream = new JSONStream();

		jsonStream.on('data', function(c) {
			expect(c).to.be.an('object');
			expect(c).to.have.a.property("id").that.is.a('string');
			expect(c).to.have.a.property("user").that.is.a('string');
			expect(c).to.have.a.property("date").that.is.a('string');
			expect(c).to.have.a.property("timestamp").that.is.a('number');
			expect(c).to.have.a.property("commentText").that.is.a('string');
			expect(c).to.have.a.property("hasReplies").that.is.a('boolean');

			if(c.hasReplies) {
				expect(c).to.have.a.property("replies").that.is.an('array');
				expect(c.replies).to.have.length.above(0);
			}
		});

		jsonStream.on('end', function(){
			done();
		});

		commentStreamer('nKTlRN3jLfw').pipe(jsonStream);
	});
});