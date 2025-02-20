import { computed, type ArrayOfMaybeSignals, type ComputedSignal } from "./computed.js";

type MapType<M extends (...args: never[]) => unknown> = (
	(
		...params: ArrayOfMaybeSignals<Parameters<M>>
	) => ComputedSignal<ReturnType<M>>
) & {
	get: M;
};

export function map<M extends (...args: any[]) => unknown>(transform: M): MapType<M> {
	function getComputed(...params: ArrayOfMaybeSignals<Parameters<M>>): ComputedSignal<ReturnType<M>>;

	function getComputed() {
		return computed(transform, arguments as never);
	}
	
	getComputed.get = transform;

	return getComputed;
}
