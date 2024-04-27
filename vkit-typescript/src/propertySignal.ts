import computed from "./computed.js";
import get from "./get.js";
import objectAssign from "./objectAssign.js";
import type {Signal, WritableSignal} from "./signal.js";
import writable from "./writable.js";

export default function propertySignal<P, K extends keyof P>(
	parent: WritableSignal<P>,
	key: K | Signal<K>,
	defaultValue: Exclude<P[K], undefined>
): WritableSignal<Exclude<P[K], undefined>>;

export default function propertySignal<P, K extends keyof P>(
	parent: WritableSignal<P>,
	key: K | Signal<K>,
): WritableSignal<P[K]>;

export default function propertySignal<P, K extends keyof P>(
	parent: WritableSignal<P>,
	key: K | Signal<K>,
	defaultValue?: P[K]
): WritableSignal<P[K] | undefined> {
	function selectValue(state: P, key: K): P[K] | undefined {
		var current = state[key];
		return current === undefined ? defaultValue : current;
	}

	function set(value: P[K]): void {
		var oldState = parent.get();
		var currentKey = get(key);
		var current = selectValue(oldState, currentKey);

		if (current !== value) {
			var newState = objectAssign({}, oldState);
			newState[currentKey] = value;
			parent.set(newState);
		}
	}

	var result = computed(selectValue, [parent, key]);
	return writable(result, set);
}
