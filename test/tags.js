var expect = require('expect.js');
var tags = require('../lib/tags');

describe('DocumentJS tags', function() {
	it('Sets @alias', function() {
		var data = {};
		tags.alias.add.call(data, '@alias my_alias');
		expect(data.alias).to.be('my_alias');
	});

	it('Sets @author', function() {
		var data = {};
		tags.author.add.call(data, '@author  David Luecke (david@bitovi.com)');
		expect(data.author).to.be('David Luecke (david@bitovi.com)');
	});

	it.skip('Parses @codestart and @codeend', function() {
		var data = {};
	});

	it('Sets @constructor', function() {

	});
});