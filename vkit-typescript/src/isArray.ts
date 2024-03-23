var toString = Object.prototype.toString;

/**
 * Takes a value and returns whether it is an array.
 * @param value The value to be checked.
 * @returns A boolean which is true if the input value is an array, false otherwise.
 */
function isArray(value: any): value is unknown[] {
	return toString.call(value) === "[object Array]";
}

export default Array.isArray || isArray;
