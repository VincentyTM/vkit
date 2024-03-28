import computed from "./computed.js";

export default function http() {
	return computed(function() {
		return {unsent: true};
	});
}
