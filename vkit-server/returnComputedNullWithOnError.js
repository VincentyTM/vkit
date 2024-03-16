import computed from "./computed.js";
import noop from "./noop.js";
import returnNull from "./returnNull.js";

export default function returnComputedNullWithOnError() {
	var result = computed(returnNull);
	result.onError = noop;
	return result;
}
