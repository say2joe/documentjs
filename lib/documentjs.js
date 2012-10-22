var walk = require('walk');
var print = console.log;
var _ = require('underscore');
var fs = require('fs');

var Type = require('./types');
var tags = require('./tags');
var Script = require('./script');
var out = require('./utils/out');
// var searchdata = require('utils/searchdata');

var DocumentJS = function(scripts, options, callback) {
	if(typeof options === 'function') {
		callback = options;
		options = null;
	}

	var ops = _.extend({
		out : scripts.replace(/[^\/]*$/, 'docs')
	}, options);
	var objects = {};

	if(!fs.existsSync(ops.out)) {
		fs.mkdirSync(ops.out);
	}

	DocumentJS.getScripts(scripts, function(err, list) {
		list.forEach(function(current) {
			print('PROCESSING: ', current);
			Script.process(current, objects, function(err, data) {
				console.log(arguments);
			})
		});
	});
}

_.extend(DocumentJS, {
	getScripts : function(scripts, cb) {
		if (/\.js$/.test(scripts)) {
			return cb(null, [scripts]);
		}
		this.getFiles(scripts, function(files) {
			// TODO readfiles here
		});
	},

	getFiles : function (folder, cb) {
		var files = [];

		// Walker options
		var walker = walk.walk(folder, { followLinks: false });

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

		walker.on('error', function(err) {
			cb(err);
		});

		walker.on('end', function() {
			cb(null, files);
		});
	},

	generateDocs : function(options, objects) {
		// go through all the objects and generate their docs
		var output = options.out ? options.out+ "/" : "";
		for ( var name in objects ) {
			if (objects.hasOwnProperty(name)){

				//get a copy of the object (we will modify it with children)
				var obj = s.extend({}, objects[name]),
					toJSON;

				// eventually have an option allow scripts
				if ( obj.type == 'script' || typeof obj != "object" ) {
					continue;
				}

				//get all children
				obj.children = this.listedChildren(obj);

				var converted = name.replace(/ /g, "_")
					.replace(/&#46;/g, ".")
					.replace(/&gt;/g, "_gt_")
					.replace(/\*/g, "_star_")
				toJSON = out(obj, undefined, "c", obj.src);
				// new s.URI(output + converted + ".json").save(toJSON);
				console.log(toJSON);
			}
		}
	}
})

module.exports = DocumentJS;
