/**
 * @class DocumentJS.tags.description
 * @tag documentation
 * @parent DocumentJS.tags
 *
 * Adds a short description.
 *
 *
 */
module.exports = {
	add : function (line) {
		var m = line.match(/^\s*@description\s*(.*)/)
		if (m) {
			this.description = m[1];
		}
	}
};