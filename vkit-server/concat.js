var map = require("./map");

function concat(){
	return Array.prototype.join.call(arguments, "");
}

module.exports = map(concat);
