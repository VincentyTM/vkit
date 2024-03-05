import computed, {ComputedSignal} from "./computed";
import {WritableSignal} from "./signal";

function getSelf<T>(value: T): T {
	return value;
}

export default function readOnly<T>(input: WritableSignal<T>): ComputedSignal<T> {
	return computed(getSelf, [input]) as ComputedSignal<T>;
}
