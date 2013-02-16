/**
 * @attribute documentjs/tags
 * @parent DocumentJS
 * A tag adds additional information to the comment being processed.
 * For example, if you want the current comment to include the author,
 * include an @@author tag.
 *
 * ## Creating your own tag
 *
 * To create a tag, you need to add to DocumentJS.tags an object with an add and an optional
 * addMore method like:
 *
 * @codestart
 * DocumentJS.tags.mytag = {
 *   add : function(line){ ... },
 *   addMore : function(line, last){ ... }
 * }
 * @codeend
 */

module.exports = {
	alias: require("./alias"),
	author: require("./author"),
	codeend: require("./codeend"),
	codestart: require("./codestart"),
	constructor: require("./constructor"),
	demo: require("./demo"),
	description: require("./description"),
	download: require("./download"),
	hide: require("./hide"),
	iframe: require("./iframe"),
	inherits: require("./inherits"),
	page: require("./page"),
	param: require("./param"),
	parent: require("./parent"),
	plugin: require("./plugin"),
	"return": require("./return"),
	tag: require("./tag"),
	test: require("./test"),
	type: require("./type"),
	image: require("./image")
}
