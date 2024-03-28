import computed, {type ArrayOfMaybeSignals, type ComputedSignal} from "./computed.js";

type MapType<M extends (...args: never[]) => unknown> = (
	(
		...params: ArrayOfMaybeSignals<Parameters<M>> & unknown[]
	) => ComputedSignal<ReturnType<M>>
) & {
	get: M;
};

function map<M extends (...args: any[]) => unknown>(transform: M): MapType<M> {
	function getComputed(...params: ArrayOfMaybeSignals<Parameters<M>> & unknown[]): ComputedSignal<ReturnType<M>>;

	function getComputed() {
		return computed(transform, arguments as unknown as ArrayOfMaybeSignals<Parameters<M>>);
	}
	
	getComputed.get = transform;

	return getComputed;
}

export default map;
