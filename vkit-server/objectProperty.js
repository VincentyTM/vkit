var get = require("./get");
var signal = require("./signal");

function getDefaultValue(defaultValue, prop) {
	var type = typeof defaultValue;
	
	if (type === "function") {
		return defaultValue();
	}
	
	if (type === "string" || type === "number" || type === "boolean" || type === "bigint" || defaultValue === null) {
		return defaultValue;
	}
	
	throw new Error("Property '" + prop + "' does not exist and there is no default value provided");
}

function objectProperty(object, property, defaultValue) {
	var obj = get(object);
	var prop = get(property);
	return signal(obj ? obj[prop] : getDefaultValue(defaultValue, prop));
}

module.exports = objectProperty;
