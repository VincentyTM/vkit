import { computed, type ComputedSignal } from "./computed.js";
import type { Signal } from "./signal.js";
import type { Template } from "./Template.js";

export type KeyedSignal<T, K> = ComputedSignal<T> & {
	key: K;
};

interface KeysAndRecords<T> {
	keys: string[];
	records: Record<string, T>;
}

interface UseKeyHandle<T> {
	array: Signal<T[]>;
	records: ComputedSignal<Record<string, T>>;
	getItem(key: string): T;
	select(key: string): KeyedSignal<T, string>;
	select(key: Signal<string>): KeyedSignal<T, Signal<string>>;
	views<ViewT extends Template<ContextT>, ContextT>(getItemView: (item: KeyedSignal<T, string>) => ViewT): Template<ContextT>;
}

function getKeys<T>(result: KeysAndRecords<T>): string[] {
	return result.keys;
}

function getRecords<T>(result: KeysAndRecords<T>): Record<string, T> {
	return result.records;
}

function selectRecord(keysAndRecords: KeysAndRecords<unknown>, currentKey: string): unknown {
	return keysAndRecords.records[currentKey];
}

/**
 * Uses a key for equality check of array items.
 * When array items are replaced (e.g. in HTTP requests or in an immutable store), so are their views.
 * This is often undesirable behavior because of state loss and performance problems.
 * 
 * If there is a key in the array items (or a key can be calculated from the items),
 * it can be used to tell if two items are equal. However, this means that the item of the
 * same key can change, so it is wrapped in a signal.
 * @example
 * function Books() {
 * 	const books = signal([
 * 		{id: "1", title: "Book 1"},
 * 		{id: "2", title: "Book 2"},
 * 		{id: "3", title: "Book 3"},
 * 	]);
 * 	
 * 	return Ul(
 * 		useKey(books, "id").views((book) => {
 * 			// book is a signal here
 * 			return Li(() => book().title);
 * 		})
 * 	);
 * }
 * 
 * @param arraySignal A signal containing the current input array.
 * @param getKey A string key or a function that maps each array item to its string key.
 * @returns An object that can be used to handle the array with the keys.
 */
export function useKey<T>(
	arraySignal: Signal<T[]>,
	getKey: keyof T
): UseKeyHandle<T>;

export function useKey<T>(
	arraySignal: Signal<T[]>,
	getKey: ((value: T) => string)
): UseKeyHandle<T>;

export function useKey<T>(
	arraySignal: Signal<T[]>,
	getKey: keyof T | ((value: T) => string)
): UseKeyHandle<T> {
	var keysAndRecordsSignal = computed(function(array: T[]) {
		var records: Record<string, T> = {};
		var n = array.length;
		var keys = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var value: T = array[i];
			
			var key: string = typeof getKey === "function"
				? getKey(value)
				: String(value[getKey]);
			
			if (key in records) {
				throw new TypeError("Key '" + key + "' is not unique");
			}
			
			records[key] = value;
			keys[i] = key;
		}
		
		return {
			keys: keys,
			records: records
		};
	}, [arraySignal]);
	
	var keysSignal = computed(getKeys, [keysAndRecordsSignal]);
	
	function select<K extends string | Signal<string>>(key: K): KeyedSignal<T, K> {
		var selected = computed(selectRecord, [keysAndRecordsSignal, key]) as unknown as KeyedSignal<T, K>;
		selected.key = key;
		return selected;
	}
	
	function views<V extends Template<P>, P>(getItemView: (item: KeyedSignal<T, string>) => V): Template<P> {
		return keysSignal.views(function(key): V {
			return getItemView(select(key));
		});
	}
	
	function getItem(key: string): T {
		return keysAndRecordsSignal.get().records[key];
	}
	
	return {
		array: arraySignal,
		getItem: getItem,
		records: computed(getRecords, [keysAndRecordsSignal]),
		select: select,
		views: views
	} as UseKeyHandle<T>;
}
