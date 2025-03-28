import { isSignal } from "./isSignal.js";
import { Signal } from "./signal.js";
import { Template } from "./Template.js";

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

/**
 * Returns repeated views.
 * @example
 * const repeated1 = repeat(100, (i) => P(`Line ${i + 1}!`));
 * const repeated2 = repeat(signal(100), (i) => P(`Line ${i + 1}!`));
 * 
 * @param count The number of repetitions. It can be wrapped in a signal to make it dynamic.
 * @param getView The function that returns the view for a specific index. The index starts from 0.
 * @returns A dynamic view list.
 */
export function repeat<T>(
	count: number,
	getView: (index: number) => T
): T[];

export function repeat<ViewT extends Template<ContextT>, ContextT>(
	count: Signal<number>,
	getView: (index: number) => ViewT
): Template<ContextT>;

export function repeat(
	count: Signal<number> | number,
	getView: (index: number) => unknown
): unknown {
	if (isSignal(count)) {
		var arrayState = count.map(createRangeArray);
		return arrayState.views(getView as (index: number) => Template<unknown>);
	}
	
	count = getNumber(count as number);
	
	var array: unknown[] = new Array(count);
	
	for (var i = 0; i < count; ++i) {
		array[i] = getView(i);
	}
	
	return array;
}
