import writable from "./writable.js";

export default function deriveSignal(parent, selector, updater) {
	return writable(parent.map(selector), function(value) {
		parent.set(updater(parent.get(), value));
	});
}
