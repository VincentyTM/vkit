import isSignal from "./isSignal.js";
import type {Signal} from "./signal.js";
import type {View} from "./view.js";

var MAX_COUNT = 9007199254740991;

function getNumber(num: number): number {
	return !(num >= 0) ? 0 : num >= MAX_COUNT ? MAX_COUNT : Math.floor(num);
}

function createRangeArray(length: number): number[] {
	length = getNumber(length);
	var array = new Array<number>(length);
	
	for (var i = 0; i < length; ++i) {
		array[i] = i;
	}
	
	return array; 
}

export default function repeat<ItemType>(
	count: number,
	getView: (index: number) => ItemType
): ItemType[];

export default function repeat<ContextType>(
	count: Signal<number>,
	getView: (index: number) => View<ContextType>
): View<ContextType>[];

export default function repeat(
	count: Signal<number> | number,
	getView: (index: number) => unknown
): unknown[] {
	if (isSignal(count)) {
		var arrayState = (count as Signal<number>).map(createRangeArray);
		return arrayState.views(getView as (index: number) => View<unknown>);
	}
	
	count = getNumber(count as number);
	
	var array: unknown[] = new Array(count);
	
	for (var i = 0; i < count; ++i) {
		array[i] = getView(i);
	}
	
	return array;
}
