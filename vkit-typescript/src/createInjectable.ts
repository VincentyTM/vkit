export interface Injectable<T> {
	readonly dependencies: readonly Injectable<unknown>[] | undefined;
	readonly token: object;
	create(): T;
	override(create: () => T): Injectable<T>;
}

export function createInjectable<T>(create: () => T, dependencies?: readonly Injectable<unknown>[]): Injectable<T> {
	return {
		dependencies: dependencies,
		token: {},
		create: create,
		override: overrideInjectable
	};
}

function overrideInjectable<T>(this: Injectable<T>, create: () => T): Injectable<T> {
	return {
		dependencies: undefined,
		token: this.token,
		create: create,
		override: overrideInjectable
	};
}
