var expect = require('expect.js');
// var Script = require('../lib/script');

var fs = require('fs');
var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('./test', { followLinks: false });

walker.on('file', function(root, stat, next) {
	var filename = root + '/' + stat.name;
	// Add this file to the list of files
	if(/\.js$/.test(filename)) {
		fs.realpath(filename, function(err, path) {
			files.push(path);
			next();
		});
	}
});

walker.on('end', function() {
	console.log(files);
});