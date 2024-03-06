import computed, {type ComputedSignal} from "./computed.js";
import type {WritableSignal} from "./signal.js";

function getSelf<T>(value: T): T {
	return value;
}

export default function readOnly<T>(input: WritableSignal<T>): ComputedSignal<T> {
	return computed(getSelf, [input]) as ComputedSignal<T>;
}
