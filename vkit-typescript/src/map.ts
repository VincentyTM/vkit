import computed, {ArrayOfMaybeSignals, ComputedSignal} from "./computed";

type MapType<TransformType extends (...args: never[]) => unknown> = (
	(
		...params: ArrayOfMaybeSignals<Parameters<TransformType>> & unknown[]
	) => ComputedSignal<ReturnType<TransformType>>
) & {
	get: TransformType;
};

function map<TransformType extends (...args: any[]) => unknown>(
	transform: TransformType
): MapType<TransformType> {
	function getComputed(
		...params: ArrayOfMaybeSignals<Parameters<TransformType>> & unknown[]
	): ComputedSignal<ReturnType<TransformType>>;

	function getComputed() {
		return computed(transform, arguments as unknown as ArrayOfMaybeSignals<Parameters<TransformType>>);
	}
	
	getComputed.get = transform;

	return getComputed;
}

export default map;
