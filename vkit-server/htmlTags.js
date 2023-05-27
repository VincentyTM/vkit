var htmlTag = require("./htmlTag.js");

module.exports = new Proxy({}, {
	get: function(target, prop, receiver){
		return htmlTag(prop.toLowerCase().replace(/_/g, "-"));
	}
});
