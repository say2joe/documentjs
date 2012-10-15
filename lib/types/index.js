var Type = require('./type');

Type('add', require('./add'));
Type('attribute', require('./attribute'));
Type('class', require('./class'));
Type('function', require('./function'));
Type('static', require('./static'));
Type('page', require('./page'));
Type('script', {
	useName: false,
	hasChildren: true
});

module.exports = Type;
