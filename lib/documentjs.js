var walk = require('walk');
var _ = require('underscore');
var fs = require('fs');
var async = require('async');
var Type = require('./types');
var tags = require('./tags');
var Script = require('./script');
var out = require('./utils/out');
var logger = require('winston');
var ejs = require('ejs');
var searchData = require('./utils/searchdata');

var DocumentJS = function (scripts, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = null;
	}

	var ops = _.extend({
		out: scripts.replace(/[^\/]*$/, 'docs')
	}, options);

	var self = this;
	self.objects = {};

	if (!fs.existsSync(ops.out)) {
		fs.mkdirSync(ops.out);
	}

	this.getScripts(scripts, function (err, list) {
		list.forEach(function (current) {
			Script.process(current, self.objects);
		});
		self.generateDocs(ops);
		self.summaryPage(ops);
		fs.writeFile(ops.out + '/searchdata.json', out(searchData(self.objects, options)), function(err) {
			logger.info('Wrote searchdata');
		});
	});
}

_.extend(DocumentJS.prototype, {
	getFiles: function (folder, cb) {
		var files = [];

		// Walker options
		var walker = walk.walk(folder, { followLinks: false });

		walker.on('file', function (root, stat, next) {
			var filename = root + '/' + stat.name;
			// Add this file to the list of files
			if (/\.js$/.test(filename)) {
				fs.realpath(filename, function (err, path) {
					files.push(path);
					next();
				});
			}
		});

		walker.on('error', function (err) {
			cb(err);
		});

		walker.on('end', function () {
			cb(null, files);
		});
	},
	getScripts: function (scripts, cb) {
		if (/\.js$/.test(scripts)) {
			return cb(null, [scripts]);
		}
		this.getFiles(scripts, function (error, files) {
			async.parallel(files.map(function (file) {
				return function (callback) {
					fs.readFile(file, function (err, data) {
						callback(null, {
							src: file,
							text: data.toString()
						});
					});
				}
			}), function (error, contents) {
				cb(error, contents);
			});
		});
	},
	generateDocs: function (options) {
		// go through all the objects and generate their docs
		var output = options.out ? options.out + "/" : "";
		var objects = this.objects;
		for (var name in objects) {
			if (objects.hasOwnProperty(name)) {

				//get a copy of the object (we will modify it with children)
				var obj = _.extend({}, objects[name]),
					toJSON;

				// eventually have an option allow scripts
				if (obj.type == 'script' || typeof obj != "object") {
					continue;
				}

				//get all children
				obj.children = this.listedChildren(obj, objects);

				var converted = name.replace(/ /g, "_")
					.replace(/&#46;/g, ".")
					.replace(/&gt;/g, "_gt_")
					.replace(/\*/g, "_star_")

				var outfile = output + converted + ".json";
				fs.writeFile(outfile, out(obj, undefined, "c", obj.src), function (err) {
					if (err) throw err;
					logger.info('Saved ' + outfile);
				});
			}
		}
	},
	// tests if item is a shallow child of parent
	shallowParent: function (item, parent) {
		if (item.parents && parent) {
			for (var i = 0; i < item.parents.length; i++) {
				if (item.parents[i] == parent.name) {
					return true;
				}
			}
		}
		return false;
	},
	// returns all recustive 'hard' children and one level of 'soft' children.
	listedChildren: function (item, stealSelf, parent) {
		var result = stealSelf ? [item.name] : [];
		if (item.children && !this.shallowParent(item, parent)) {
			for (var c = 0; c < item.children.length; c++) {
				var child = this.objects[item.children[c]];
				var adds = this.listedChildren(child, true, item);
				if (adds) {
					result = result.concat(adds);
				}

			}
		}
		return result;
	},
	summaryPage: function (options) {
		// find index page
		var path = options.out,
			base = path.replace(/[^\/]*$/, ""),
			renderData = {
				pathToRoot: base.replace(/\/[^\/]*$/, ""),
				path: path,
				indexPage: this.objects.index
			}

		// checks if you have a summary
		if (fs.existsSync(base + "summary.ejs")) {
			logger.info("Using summary at " + base + "summary.ejs");
			this.renderTo(base + "docs.html", base + "summary.ejs", renderData)
		} else {
			logger.info("Using default page layout.  Overwrite by creating: " + base + "summary.ejs");
			this.renderTo(base + "docs.html", __dirname + "/../jmvcdoc/summary.ejs", renderData);
		}
	},
	renderTo: function (file, ejsFile, data) {
		fs.readFile(ejsFile, function (err, view) {
			if(err) { throw err; }
			fs.writeFile(file, ejs.render(view.toString(), data), function (err) {
				if (err) throw err;
				logger.info('Saved ' + file);
			});
		});
	}
})

module.exports = DocumentJS;
