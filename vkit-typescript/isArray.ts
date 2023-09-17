var toString = Object.prototype.toString;

function isArray(value: any): boolean {
	return toString.call(value) === "[object Array]";
}

export default Array.isArray || isArray;
