import isSignal from "./isSignal.js";

export default function get(signalOrValue) {
	return isSignal(signalOrValue) ? signalOrValue.get() : signalOrValue;
}
