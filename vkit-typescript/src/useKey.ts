import computed, {type ComputedSignal} from "./computed.js";
import isSignal from "./isSignal.js";
import type {Signal} from "./signal.js";
import type {View} from "./view.js";

type KeyedSignal<T> = ComputedSignal<T> & {
	key: string | Signal<string>;
};

type Records<T> = {
	[key: string]: T;
};

type Store<T> = {
	keys: string[];
	records: Records<T>;
};

type UseKeyHandle<T> = {
	array: Signal<T[]>;
	getItem(key: string): T;
	records: ComputedSignal<Records<T>>;
	select(key: string | Signal<string>): KeyedSignal<T>;
	views<ContextT>(getView: (item: KeyedSignal<T>) => View<ContextT>): View<ContextT>;
};

function getKeys<T>(result: Store<T>): string[] {
	return result.keys;
}

function getRecords<T>(result: Store<T>): Records<T> {
	return result.records;
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
export default function useKey<T>(
	arraySignal: Signal<T[]>,
	getKey: keyof T
): UseKeyHandle<T>;

export default function useKey<T>(
	arraySignal: Signal<T[]>,
	getKey: ((value: T) => string)
): UseKeyHandle<T>;

export default function useKey<T>(
	arraySignal: Signal<T[]>,
	getKey: (keyof T) | ((value: T) => string)
): UseKeyHandle<T> {
	var signal = computed(function(array: T[]) {
		var records: Records<T> = {};
		var n = array.length;
		var keys = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var value: T = array[i];
			
			var key: string = typeof getKey === "function"
				? getKey(value)
				: String(value[getKey as keyof T]);
			
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
	
	var keysSignal = computed(getKeys, [signal]);
	
	function select(key: string | Signal<string>): KeyedSignal<T> {
		var selected = computed(function() {
			var k = isSignal(key) ? key.get() : key;
			return signal.get().records[k];
		}) as KeyedSignal<T>;
		
		if (isSignal(key)) {
			key.subscribe(selected.invalidate);
		}
		
		signal.subscribe(selected.invalidate);
		selected.key = key;
		return selected;
	}
	
	function views<ContextT>(getView: (item: KeyedSignal<T>) => View<ContextT>): View<ContextT> {
		return keysSignal.views(function(key): View<ContextT> {
			return getView(select(key));
		});
	}
	
	function getItem(key: string): T {
		return signal.get().records[key];
	}
	
	return {
		array: arraySignal,
		getItem: getItem,
		records: signal.map(getRecords),
		select: select,
		views: views
	};
}
