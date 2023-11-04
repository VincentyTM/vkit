var computed = require("./computed");

function userMedia() {
	var media = computed(function() {
		return null;
	});
	
	media.pending = computed(function() {
		return false;
	});
	
	return media;
}

module.exports = userMedia;
