import type {Signal} from "./signal.js";

export default function isSignal(value: any): value is Signal<unknown> {
	return !!(value && value.isSignal === true);
}
