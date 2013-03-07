var Mocha = require('mocha');
//Add the interface
Mocha.interfaces["qunit-mocha-ui"] = require("qunit-mocha-ui");
//Tell mocha to use the interface.
var mocha = new Mocha({ui:"qunit-mocha-ui", reporter:"spec"});
//Add your test files
mocha.addFile(__dirname + "/tags_tests.js");
//Run your tests
mocha.run(function(failures){
	process.exit(failures);
});