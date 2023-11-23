var computed = require("./computed");
var noop = require("./noop");
var returnNull = require("./returnNull");

function granted() {
	return false;
}

module.exports = function() {
	var prompt = computed(function(perm) {
		return {
			state: "default"
		};
	});
	
	return {
		granted: granted,
		permission: prompt,
		requestPermission: noop,
		show: returnNull
	};
}