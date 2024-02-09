var computed = require("./computed");
var noop = require("./noop");

function userMedia() {
	var media = computed(function() {
		return null;
	});
	
	media.onError = noop;
	
	media.pending = computed(function() {
		return false;
	});
	
	return media;
}

module.exports = userMedia;
