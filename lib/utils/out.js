var logger = require('winston');

module.exports = function (data, how, Char, filename) {
	try {
		var converted = JSON.stringify(data);
		return (Char || "C") + "(" + converted + ")"
	} catch (e) {
		logger.warn(e + ' (' + filename + ')')
	}
}
