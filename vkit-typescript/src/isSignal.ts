import {Signal} from "./signal";

export default function isSignal(value: any): value is Signal<unknown> {
	return !!(value && value.isSignal === true);
}
