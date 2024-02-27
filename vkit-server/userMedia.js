import computed from "./computed.js";
import noop from "./noop.js";

export default function userMedia() {
	var media = computed(function() {
		return null;
	});
	
	media.onError = noop;
	
	media.pending = computed(function() {
		return false;
	});
	
	return media;
}
