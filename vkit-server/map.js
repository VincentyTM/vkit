import computed from "./computed.js";

export default function map(transform) {
	function getComputed() {
		return computed(transform, arguments);
	}
	
	getComputed.get = transform;
	
	return getComputed;
}
