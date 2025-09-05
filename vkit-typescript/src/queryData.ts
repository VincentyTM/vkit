import { computed, Signal } from "./computed.js";

export interface DataQuery<T> {
	descending?: boolean;
	skip?: number;
	take?: number;
	order?(value1: T, value2: T): number;
	where?(value: T): boolean;
}

export interface DataQueryResult<T> {
	readonly count: Signal<number>;
	readonly keys: Signal<string[]>;
	query(query: DataQuery<T>): DataQueryResult<T>;
}

interface DataQueryResultInternals<T> extends DataQueryResult<T> {
	readonly rawContexts: Signal<DataWithContext<T>[]>;
}

export type DataSet<T> = Record<string, T | undefined>;

interface DataWithContext<T> {
	readonly id: string;
	readonly query: DataQuery<T>;
	readonly value: T;
}

/**
 * Returns a new query result object with the given data set's queried items.
 * @example
 * interface Book {
 * 	author: string;
 * 	title: string;
 * 	year: number;
 * }
 * 
 * const dataSet = signal<DataSet<Book>>({}); // Provide some data here
 * 
 * const oldest3BooksStartingWithA = queryData(dataSet, {
 * 	descending: false,
 * 	skip: 0,
 * 	take: 3,
 * 	order: (a, b) => a.year - b.year,
 * 	where: book => book.title.startsWith("A"),
 * });
 * 
 * effect(() => console.log("Oldest 3 books starting with A:", oldest3BooksStartingWithA.keys()));
 * @param dataSet An object with key-value pairs, optionally wrapped in a signal.
 * @param query A query object with optional parameters such as `descending`, `skip`, `take`, `order` or `where`. It can also be wrapped in a signal.
 * @returns An object with the query result. It contains the `count` and `keys` signals, and a `query` method for chaining.
*/
export function queryData<T>(dataSet: DataSet<T> | Signal<DataSet<T>>, query: DataQuery<T> | Signal<DataQuery<T>>): DataQueryResult<T> {
	var selection = computed(selectQueriedData, [dataSet, query]) as Signal<DataWithContext<T>[]>;

	var result: DataQueryResultInternals<T> = {
		count: selection.map(selectCount),
		keys: selection.map(selectIds),
		rawContexts: selection,
		query: queryThis
	};

	return result;
}

function queryThis<T>(this: DataQueryResultInternals<T>, query: DataQuery<T> | Signal<DataQuery<T>>): DataQueryResult<T> {
	var selection = computed(selectRequeriedData, [this.rawContexts, query]) as Signal<DataWithContext<T>[]>;

	var result: DataQueryResultInternals<T> = {
		count: selection.map(selectCount),
		keys: selection.map(selectIds),
		rawContexts: selection,
		query: queryThis
	};

	return result;
}

function selectCount<T>(selection: DataWithContext<T>[]): number {
	return selection.length;
}

function selectId<T>(dataWithContext: DataWithContext<T>): string {
	return dataWithContext.id;
}

function selectIds<T>(selection: DataWithContext<T>[]): string[] {
	return map(selection, selectId);
}

function selectRequeriedData<T>(dataSet: DataWithContext<T>[], query: DataQuery<T>): DataWithContext<T>[] {
	var selection: DataWithContext<T>[] = [];
	var n = dataSet.length;

	for (var i = 0; i < n; ++i) {
		var context = dataSet[i];

		if (query.where !== undefined && !query.where(context.value)) {
			continue;
		}

		selection.push({
			id: context.id,
			query: query,
			value: context.value
		});
	}

	if (query.order !== undefined) {
		selection.sort(compareData);
	}

	if (query.skip !== undefined) {
		if (query.take !== undefined) {
			return selection.slice(query.skip, query.skip + query.take);
		}

		return selection.slice(query.skip);
	}

	if (query.take !== undefined) {
		return selection.slice(0, query.take);
	}

	return selection;
}

function selectQueriedData<T>(dataSet: DataSet<T>, query: DataQuery<T>): DataWithContext<T>[] {
	var selection: DataWithContext<T>[] = [];

	for (var id in dataSet) {
		var record = dataSet[id];

		if (record === undefined || (query.where !== undefined && !query.where(record))) {
			continue;
		}

		selection.push({
			id: id,
			query: query,
			value: record
		});
	}

	if (query.order !== undefined) {
		selection.sort(compareData);
	}

	if (query.skip !== undefined) {
		if (query.take !== undefined) {
			return selection.slice(query.skip, query.skip + query.take);
		}

		return selection.slice(query.skip);
	}

	if (query.take !== undefined) {
		return selection.slice(0, query.take);
	}

	return selection;
}

function compareData<T>(a: DataWithContext<T>, b: DataWithContext<T>): number {
	var order = a.query.order;

	if (order === undefined) {
		return 0;
	}

	var result = order(a.value, b.value);

	if (a.query.descending) {
		result = -result;
	}

	return result;
}

function map<T, U>(array: T[], transform: (value: T, index: number, array: T[]) => U): U[] {
    if (typeof array.map === "function") {
        return array.map(transform);
    }

    var n = array.length;
    var newArray = new Array<U>(n);

    for (var i = 0; i < n; ++i) {
        newArray[i] = transform(array[i], i, array);
    }

    return newArray;
}
