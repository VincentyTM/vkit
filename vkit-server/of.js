function getValue(object, property) {
	return object[property];
}

var handler = {
	get: getValue
};

function of(object) {
	return new Proxy(object, handler);
}

module.exports = of;
