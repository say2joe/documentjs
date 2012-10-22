var print = console.log;

module.exports = function (data, how, Char, filename) {
	try {
		var converted = JSON.stringify(data); // toJSON(data, how);
		return (Char || "C") + "(" + converted + ")"
	} catch (e) {
		print(e + ' (' + filename + ')')
	}
}
