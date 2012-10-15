var Type = require('./types');
var tags = require('./tags');
var Script = require('./types/script');
var File = require('file-utils').File;

// var searchdata = require('utils/searchdata');
var out = require('utils/out');
var _ = require('underscore');

var objects = {};
var DocumentJS = function (scripts, options) {
	// an html file, a js file or a directory
	options = options || {};

	if (typeof scripts == 'string') {
		if (!options.out) {
			if (/\.html?$|\.js$/.test(scripts)) {
				options.out = scripts.replace(/[^\/]*$/, 'docs')
			} else { //folder
				options.out = scripts + "/docs";
			}
		}
		scripts = DocumentJS.getScripts(scripts)
	}

	// an array of folders
	if (options.markdown) {
		for (var i = 0; i < options.markdown.length; i++) {
			DocumentJS.files(options.markdown[i], function (path, f) {
				if (/\.md$/.test(f)) {
					scripts.push(path)
				}
			})
		}
	}

	//create each Script, which will create each class/constructor, etc
	print("PROCESSING SCRIPTS\n")
	for (var s = 0; s < scripts.length; s++) {
		Script.process(scripts[s], objects)
	}

	print('\nGENERATING DOCS -> ' + options.out + '\n')

	// generate individual JSONP forms of individual comments
	DocumentJS.generateDocs(options);

	// make combined search data
	// searchData(objects, options)

	//make summary page (html page to load it all)
	// DocumentJS.summaryPage(options);
};

_.extend(DocumentJS, {
	files : function (path, cb) {
		var getJSFiles = function (dir) {
			var file = new s.File(dir);
			if (file.isFile()) {
				cb(dir.replace('\\', '/'), dir);
			} else {
				file.contents(function (f, type) {
					if (type == 'directory') {
						getJSFiles(dir + "/" + f)
					} else {
						cb((dir + "/" + f).replace('\\', '/'), f);
					}
				});
			}
		};
		getJSFiles(path);
	},

	// gets scripts from a path
	getScripts : function (file) {
		var collection = [], scriptUrl;
		if (/\.js$/.test(file)) { // load just this file
			collection.push(file)
		}
		else { // assume its a directory
			this.files(file, function (path, f) {
				if (/\.(js|md)$/.test(f)) {
					collection.push(path)
				}
			});
		}
		return collection;
	},

	generateDocs : function (options) {
		// go through all the objects and generate their docs
		var output = options.out ? options.out + "/" : "";
		for (var name in objects) {
			if (objects.hasOwnProperty(name)) {

				//get a copy of the object (we will modify it with children)
				var obj = s.extend({}, objects[name]),
					toJSON;

				// eventually have an option allow scripts
				if (obj.type == 'script' || typeof obj != "object") {
					continue;
				}

				//get all children
				obj.children = this.listedChildren(obj);

				var converted = name.replace(/ /g, "_")
					.replace(/&#46;/g, ".")
					.replace(/&gt;/g, "_gt_")
					.replace(/\*/g, "_star_")
				toJSON = out(obj, undefined, "c", obj.src);
				new s.URI(output + converted + ".json").save(toJSON);
			}

		}
		//print(commentTime);
		//print(processTime)
	},

	// tests if item is a shallow child of parent
	shallowParent : function (item, parent) {
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
	listedChildren : function (item, stealSelf, parent) {
		var result = stealSelf ? [item.name] : [];
		if (item.children && !this.shallowParent(item, parent)) {
			for (var c = 0; c < item.children.length; c++) {
				var child = objects[item.children[c]];
				var adds = this.listedChildren(child, true, item);
				if (adds) {
					result = result.concat(adds);
				}

			}
		}
		return result;
	},

	summaryPage : function (options) {
		//find index page
		var path = options.out,
			base = path.replace(/[^\/]*$/, ""),
			renderData = {
				pathToRoot : s.URI(base.replace(/\/[^\/]*$/, "")).pathToRoot(),
				path : path,
				indexPage : objects.index
			}

		//checks if you have a summary
		if (readFile(base + "summary.ejs")) {
			print("Using summary at " + base + "summary.ejs");
			DocumentJS.renderTo(base + "docs.html", base + "summary.ejs", renderData)
		} else {
			print("Using default page layout.  Overwrite by creating: " + base + "summary.ejs");
			DocumentJS.renderTo(base + "docs.html", "documentjs/jmvcdoc/summary.ejs", renderData);
		}
	},

	renderTo : function (file, ejs, data) {
		new s.URI(file).save(new EJS({
			text : readFile(ejs)
		}).render(data));
	}
})


module.exports = DocumentJS;
