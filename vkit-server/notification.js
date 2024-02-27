import computed from "./computed.js";
import noop from "./noop.js";
import returnNull from "./returnNull.js";

function granted() {
	return false;
}

export default function notification() {
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
