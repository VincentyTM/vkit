var toString = Object.prototype.toString;

function isArray(value: any): value is unknown[] {
	return toString.call(value) === "[object Array]";
}

export default Array.isArray || isArray;
