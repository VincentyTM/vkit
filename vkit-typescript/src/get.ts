import isSignal from "./isSignal.js";
import type {Signal} from "./signal.js";

export default function get<ValueType>(signalOrValue: ValueType | Signal<ValueType>): ValueType {
	return isSignal(signalOrValue) ? (signalOrValue as Signal<ValueType>).get() : (signalOrValue as ValueType);
}
