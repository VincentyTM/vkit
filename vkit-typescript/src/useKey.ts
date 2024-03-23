import computed, {type ComputedSignal} from "./computed.js";
import isSignal from "./isSignal.js";
import type {Signal} from "./signal.js";
import type {View} from "./view.js";

type KeyedSignal<ValueType> = ComputedSignal<ValueType> & {
	key: string | Signal<string>;
};

type ObjectWithStringKeys = {
	[key: string]: string;
};

type Records<ValueType> = {
	[key: string]: ValueType;
};

type Store<ValueType> = {
	keys: string[];
	records: Records<ValueType>;
};

type UseKeyHandle<ValueType> = {
	array: Signal<ValueType[]>;
	getItem(key: string): ValueType;
	records: ComputedSignal<Records<ValueType>>;
	select(key: string | Signal<string>): KeyedSignal<ValueType>;
	views(getView: (item: KeyedSignal<ValueType>) => View): View;
};

function getKeys<ValueType>(result: Store<ValueType>): string[] {
	return result.keys;
}

function getRecords<ValueType>(result: Store<ValueType>): Records<ValueType> {
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
export default function useKey<ValueType extends ObjectWithStringKeys>(
	arraySignal: Signal<ValueType[]>,
	getKey: string
): UseKeyHandle<ValueType>;

export default function useKey<ValueType>(
	arraySignal: Signal<ValueType[]>,
	getKey: ((value: ValueType) => string)
): UseKeyHandle<ValueType>;

export default function useKey<ValueType>(
	arraySignal: Signal<ValueType[]>,
	getKey: string | ((value: ValueType) => string)
): UseKeyHandle<ValueType> {
	var isFunction = typeof getKey === "function";
	
	var signal = computed(function(array: ValueType[]) {
		var records: Records<ValueType> = {};
		var n = array.length;
		var keys = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var value: ValueType = array[i];
			
			var key: string = isFunction
				? (getKey as (value: ValueType) => string)(value)
				: (value as unknown as ObjectWithStringKeys)[getKey as string];
			
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
	
	function select(key: string | Signal<string>): KeyedSignal<ValueType> {
		var selected = computed(function() {
			var k = isSignal(key) ? key.get() : key;
			return signal.get().records[k];
		}) as KeyedSignal<ValueType>;
		
		if (isSignal(key)) {
			key.subscribe(selected.invalidate);
		}
		
		signal.subscribe(selected.invalidate);
		selected.key = key;
		return selected;
	}
	
	function views(getView: (item: KeyedSignal<ValueType>) => View): View {
		return keysSignal.views(function(key) {
			return getView(select(key));
		});
	}
	
	function getItem(key: string): ValueType {
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
