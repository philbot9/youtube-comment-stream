var expect = require('chai').expect;

var getSessionToken = require('../lib/youtube-session.js');

describe("Youtube Session", function(){
	it("should export a function", function(){
		expect(getSessionToken).to.be.a('function');
	});

	it("should throw an error if no video ID is given", function(done){
		getSessionToken(null, function(error, sessionToken){
			expect(sessionToken).not.to.exist;
			expect(error).to.exist;
			expect(error).to.be.instanceof(Error);
			expect(sessionToken).to.not.exist;
			done();
		});
	});

	it("should get a session token", function(done){
		this.timeout(10000);
		getSessionToken('eKEwL-10s7E', function(error, sessionToken){
			expect(sessionToken).to.be.a('string');
			expect(sessionToken).to.have.length.above(1);
			done();
		});
	});

	it("should remember a session token", function(done){
		this.timeout(10000);
		getSessionToken('eKEwL-10s7E', function(error, sessionToken1){
			getSessionToken('eKEwL-10s7E', function(error, sessionToken2){
				expect(sessionToken1).to.equal(sessionToken2);
				done();
			});
		});
	});
});