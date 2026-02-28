export interface Injectable<T> extends InjectableConfig<T> {
	readonly dependencies: readonly Injectable<unknown>[] | undefined;
	readonly transient: boolean;
	override(create: () => T): InjectableConfig<T>;
}

export interface InjectableConfig<T> {
	readonly token: object;
	create(): T;
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

function overrideInjectable<T>(this: Injectable<T>, create: () => T): InjectableConfig<T> {
	return {
		token: this.token,
		create: create
	};
}
