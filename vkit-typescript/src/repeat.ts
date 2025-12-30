import { Signal } from "./computed.js";
import { isSignal } from "./isSignal.js";
import { Template } from "./Template.js";
import { viewList } from "./viewList.js";

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
 * Returns repeated view templates, each generated with a different index.
 * @example
 * function Lines() {
 * 	const lineCount = signal(10);
 * 
 * 	return [
 * 		Button("Clear", {
 * 			onclick: () => lineCount.set(0)
 * 		}),
 * 		Button("Add line", {
 * 			onclick: () => lineCount.update(x => x + 1)
 * 		}),
 * 		repeat(lineCount, (i) => P(`Line ${i + 1}!`))
 * 	];
 * }
 * 
 * @param count The template count. If it is a signal, the number of rendered templates may change dynamically based on the signal's current value.
 * @param getTemplate The function that returns the template for a specific index. The index starts from 0.
 * @returns A dynamic view list.
 */
export function repeat<T>(
	count: number,
	getTemplate: (index: number) => T
): T[];

export function repeat<V extends Template<P>, P>(
	count: Signal<number>,
	getTemplate: (index: number) => V
): Template<P>;

export function repeat(
	count: Signal<number> | number,
	getTemplate: (index: number) => unknown
): unknown {
	if (isSignal(count)) {
		var arrayState = count.map(createRangeArray);
		return viewList(arrayState, getTemplate as (index: number) => Template<unknown>);
	}

	count = getNumber(count);

	var array: unknown[] = new Array(count);

	for (var i = 0; i < count; ++i) {
		array[i] = getTemplate(i);
	}

	return array;
}
