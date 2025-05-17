export interface Injectable<T> {
	create(): T;
}

export function createInjectable<T>(create: () => T): Injectable<T> {
	return {
		create: create
	};
}
