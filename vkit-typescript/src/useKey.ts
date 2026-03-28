import { computed, Signal } from "./computed.js";
import { Template } from "./Template.js";
import { viewList } from "./viewList.js";

interface KeysAndRecords<T> {
	readonly indexes: Record<string, number>;
	readonly keys: string[];
	readonly records: Record<string, T>;
}

interface UseKeyHandle<T> {
	readonly array: Signal<readonly T[]>;
	readonly records: Signal<Record<string, T | undefined>>;
	getItem(key: string): T | undefined;
	select(key: string): Signal<T | undefined>;
	select(key: Signal<string>): Signal<T | undefined>;
	viewList(getItemTemplate: (item: Signal<T>, key: string, index: Signal<number>) => Template): Template;
}

function getIndex<T>(keysAndRecords: KeysAndRecords<T>, key: string): number {
	return keysAndRecords.indexes[key];
}

function getKeys<T>(result: KeysAndRecords<T>): string[] {
	return result.keys;
}

function getRecords<T>(result: KeysAndRecords<T>): Record<string, T> {
	return result.records;
}

function selectRecord<T>(keysAndRecords: KeysAndRecords<T>, currentKey: string): T {
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
 * 
 * @example
 * function Books() {
 * 	const books = signal([
 * 		{id: "1", title: "Book 1"},
 * 		{id: "2", title: "Book 2"},
 * 		{id: "3", title: "Book 3"},
 * 	]);
 * 
 * 	return Ul(
 * 		useKey(books, "id").viewList((book, id, index) => {
 * 			// book and index are signals
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
	arraySignal: Signal<readonly T[]>,
	getKey: keyof T
): UseKeyHandle<T>;

export function useKey<T>(
	arraySignal: Signal<readonly T[]>,
	getKey: ((value: T) => string)
): UseKeyHandle<T>;

export function useKey<T>(
	arraySignal: Signal<readonly T[]>,
	getKey: keyof T | ((value: T) => string)
): UseKeyHandle<T> {
	var keysAndRecordsSignal = computed(function(array: ArrayLike<T>): KeysAndRecords<T> {
		var indexes: Record<string, number> = {};
		var records: Record<string, T> = {};
		var n = array.length;
		var keys = new Array<string>(n);

		for (var i = 0; i < n; ++i) {
			var value: T = array[i];

			var key: string = typeof getKey === "function"
				? getKey(value)
				: String(value[getKey]);

			if (key in records) {
				throw new TypeError("Key '" + key + "' is not unique");
			}

			indexes[key] = i;
			records[key] = value;
			keys[i] = key;
		}

		return {
			indexes: indexes,
			keys: keys,
			records: records
		};
	}, [arraySignal]);

	var keysSignal = computed(getKeys, [keysAndRecordsSignal]);
	var recordsSignal = computed<
		(result: KeysAndRecords<T>) => Record<string, T>
	>(getRecords, [keysAndRecordsSignal]);

	function select(key: string | Signal<string>): Signal<T> {
		return computed<
			(keysAndRecords: KeysAndRecords<T>, currentKey: string) => T
		>(selectRecord, [keysAndRecordsSignal, key]);
	}

	function selectIndex(key: string | Signal<string>): Signal<number> {
		return computed<
			(keysAndRecords: KeysAndRecords<T>, currentKey: string) => number
		>(getIndex, [keysAndRecordsSignal, key]);
	}

	function useKeyViewList(getItemTemplate: (item: Signal<T>, key: string, index: Signal<number>) => Template): Template {
		return viewList(keysSignal, function(key) {
			return getItemTemplate(select(key), key, selectIndex(key));
		});
	}

	function getItem(key: string): T | undefined {
		return keysAndRecordsSignal.get().records[key];
	}

	return {
		array: arraySignal,
		records: recordsSignal,
		getItem: getItem,
		select: select,
		viewList: useKeyViewList
	};
}
