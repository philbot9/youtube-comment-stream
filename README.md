youtube-comment-stream
=================
Scrapes comments from a Youtube video and emits them as JSON objects through a readable stream.
###Installation
```
$ npm install
```
###Usage
```
var commentStream = require('json-stream-to-sqlite');
var readableStream = commentStream("videoID");

readableStream.on('data', function(chunk) {
	//do something
});
```