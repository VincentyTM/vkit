import isSignal from "./isSignal";
import {Signal} from "./signal";

function get<ValueType>(signalOrValue: ValueType | Signal<ValueType>): ValueType {
	return isSignal(signalOrValue) ? (signalOrValue as Signal<ValueType>).get() : (signalOrValue as ValueType);
}

export default get;
