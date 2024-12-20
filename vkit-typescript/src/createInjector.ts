import type {Provider} from "./createProvider.js";

export type TokenClass = new () => unknown;
export type TokenFactory = () => unknown;
export type TokenLike = TokenClass | TokenFactory;

export type InstanceOf<TokenT> = (
	TokenT extends TokenClass ? InstanceType<TokenT> :
	TokenT extends TokenFactory ? ReturnType<TokenT> :
	never
);

export type Injector = {
	container: WeakMap<TokenLike, Provider<unknown>>,
	handleMissingProvider: ((token: TokenClass) => InstanceOf<TokenClass>) | null,
	parent: Injector | null
};

var Container = typeof WeakMap === "function" ? WeakMap : function<K extends object, V>(
	this: {
		get(key: K): V | undefined;
		set(key: K, value: V): void;
	}
) {
	var array: (K | V)[] = [];

	this.get = function(key: K): V | undefined {
		for (var i = array.length - 2; i >= 0; i -= 2) {
			if (array[i] === key) {
				return array[i + 1] as V;
			}
		}
		return undefined;
	};

	this.set = function(key: K, value: V): void {
		for (var i = array.length - 2; i >= 0; i -= 2) {
			if (array[i] === key) {
				array[i + 1] = value;
				return;
			}
		}
		array.push(key, value);
	};
} as unknown as WeakMapConstructor;

export default function createInjector(
	parent: Injector | null,
	handleMissingProvider: ((token: TokenClass) => InstanceOf<TokenClass>) | null
): Injector {
	return {
		container: new Container<TokenLike, Provider<unknown>>(),
		handleMissingProvider: handleMissingProvider,
		parent: parent
	};
}
