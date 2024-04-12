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

export default function of(object, property, defaultValue) {
	if (!object || !(typeof object === "object" || typeof object === "function")) {
		return object;
	}
	
	if (typeof property === "string") {
		if (!(property in object)) {
			object[property] = getDefaultValue(defaultValue, property);
		}
		
		return object[property];
	}
	
	return object;
}
