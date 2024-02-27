function getValue(object, property) {
	return object[property];
}

var handler = {
	get: getValue
};

export default function of(object) {
	if (!object || !(typeof object === "object" || typeof object === "function")) {
		return object;
	}
	
	return new Proxy(object, handler);
}
