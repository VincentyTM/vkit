var toString = Object.prototype.toString;

function isArray(value) {
	return toString.call(value) === "[object Array]";
}

export default Array.isArray || isArray;
