var readOnly = require("./readOnly");
var scope = require("./scope");

function preferredLanguages() {
	var currentScope = scope.get();
	var header = currentScope.req.headers["accept-language"];
	
	if (!header) {
		return [];
	}
	
	var langs = header.replace(/\s+/g, "").split(",");
	
	for (var i = langs.length; i--;) {
		var l = langs[i];
		var p = l.indexOf(";");
		
		if (p !== -1) {
			langs[i] = l.substring(0, p);
		}
	}
	
	return readOnly(langs);
}

module.exports = preferredLanguages;
