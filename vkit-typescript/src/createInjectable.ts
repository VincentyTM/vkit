export interface Injectable<T> {
	readonly token: object;
	create(): T;
	override(create: () => T): Injectable<T>;
}

export function createInjectable<T>(create: () => T): Injectable<T> {
	return {
		token: {},
		create: create,
		override: overrideInjectable
	};
}

function overrideInjectable<T>(this: Injectable<T>, create: () => T): Injectable<T> {
	return {
		token: this.token,
		create: create,
		override: overrideInjectable
	};
}
