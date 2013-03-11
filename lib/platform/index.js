if(h.win.load && h.win.readUrl && h.win.readFile) {
	module.exports = require('./rhino');
} else if(window && window.document) {
	// Browser
} else {
	module.exports = require('./node');
}