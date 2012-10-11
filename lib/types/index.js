var Type = require('./type');
var _ = require('underscore');
var types = ['add', 'static', 'page'];

_.each(types, function(name) {
	Type(name, require('./' + name));
});

return Type;
