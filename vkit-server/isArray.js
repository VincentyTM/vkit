var toString = Object.prototype.toString;

function isArray(value){
	return toString.call(value) === "[object Array]";
}

module.exports = Array.isArray || isArray;
