export interface Injectable<T> {
	readonly dependencies: readonly Injectable<unknown>[] | undefined;
	readonly token: object;
	readonly transient: boolean;
	create(): T;
	override(create: () => T): Injectable<T>;
}

interface InjectableOptions {
	dependencies?: readonly Injectable<unknown>[];
	transient?: boolean;
}

export function createInjectable<T>(create: () => T, options?: InjectableOptions): Injectable<T> {
	return {
		dependencies: options && options.dependencies,
		token: {},
		transient: options && options.transient || false,
		create: create,
		override: overrideInjectable
	};
}

function overrideInjectable<T>(this: Injectable<T>, create: () => T): Injectable<T> {
	return {
		dependencies: undefined,
		token: this.token,
		transient: false,
		create: create,
		override: overrideInjectable
	};
}
