var createHistoryHandler = require("./history.js");
var url = require("./url.js");

function path(){
	return url(createHistoryHandler().url()).base;
}

module.exports = path;
