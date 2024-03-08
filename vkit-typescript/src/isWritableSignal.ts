import type {WritableSignal} from "./signal.js";

export default function isWritableSignal(value: any): value is WritableSignal<unknown> {
	return !!(value && value.isSignal === true && value.set);
}
