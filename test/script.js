var expect = require('expect.js');
var Script = require('../lib/script');
var fs = require('fs');
var fixture = __dirname + '/fixtures/file.js';

describe('DocumentJS Script', function() {
	it('Removes indentation', function() {

	});

	it('Gets comments', function(done) {
		fs.readFile(fixture, function (err, data) {
			if (err) throw err;
			var content = data.toString();
			var comments = Script.getComments(content);
			expect(comments.length).to.be(2);
			expect(comments[0]).to.have.property('comment');
			expect(comments[0]).to.have.property('code');
			expect(comments[0]).to.have.property('line');
			expect(comments[0].line).to.be(0);
			expect(comments[0].code).to.be("var test = 'Hello there';");
			expect(comments[1].comment[0]).to.be('Another comment');
			expect(comments[1].line).to.be(11);
			done();
		});
	});

	it('Processes a file', function(done) {
		Script.process(fixture, {}, function(error, objects) {
			expect(objects).to.have.property(fixture);
			expect(objects).to.have.property('index');
			console.log(objects);
			done();
		})
	});
});