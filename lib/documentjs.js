var _ = require('underscore');
var fs = require('fs');
var async = require('async');
var wrench = require('wrench');

var logger = require('winston');
var Type = require('./types');
var tags = require('./tags');
var Script = require('./script');
var out = require('./utils/out');
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

	ops.json = ops.out + '/json/';

	var self = this;
	self.objects = {};

	if (!fs.existsSync(ops.out)) {
		fs.mkdirSync(ops.out);
	}

	// Copy jmvcdoc production files
	wrench.copyDirSyncRecursive(__dirname + '/../jmvcdoc/production', ops.out);

	if (!fs.existsSync(ops.json)) {
		fs.mkdirSync(ops.json);
	}

	this.getScripts(scripts, function (err, list) {
		list.forEach(function (current) {
			Script.process(current, self.objects);
		});
		self.generateDocs(ops);
		self.summaryPage(ops);
		fs.writeFile(ops.json + '/searchdata.json', out(searchData(self.objects, options)), function(err) {
			logger.info('Wrote searchdata');
		});
	});
}

_.extend(DocumentJS.prototype, {
	getScripts: function (scripts, cb) {
		if (/\.js$/.test(scripts)) {
			return cb(null, [scripts]);
		}

		var files = wrench.readdirSyncRecursive(scripts)
		async.parallel(files.filter(function(file) {
			return /\.js$/.test(file);
		}).map(function (file) {
			file = scripts + '/' + file;
			return function (callback) {
				fs.readFile(file, function (err, data) {
					callback(err, data && {
						src: file,
						text: data.toString()
					});
				});
			}
		}), function (error, contents) {
			cb(error, contents);
		});
	},
	generateDocs: function (options) {
		// go through all the objects and generate their docs
		var output = options.json;
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
			base = path + '/',
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
			this.renderTo(base + "index.html", __dirname + "/../jmvcdoc/summary.ejs", renderData);
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
