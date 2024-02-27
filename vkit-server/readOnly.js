import computed from "./computed.js";

function getSelf(value) {
	return value;
}

export default function readOnly(signalOrValue) {
	return computed(getSelf, [signalOrValue]);
}
