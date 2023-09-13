import {Provider} from "./provider";

export type TokenClass = new () => unknown;
export type TokenFactory = () => unknown;
export type TokenLike = TokenClass | TokenFactory;

export type InstanceOf<TokenType> = (
    TokenType extends TokenClass ? InstanceType<TokenType> :
    TokenType extends TokenFactory ? ReturnType<TokenType> :
    never
);

export type Injector = {
    container: WeakMap<TokenLike, Provider<unknown>>,
    handleMissingProvider: ((token: TokenClass) => InstanceOf<TokenClass>) | null,
    parent: Injector | null
};

var Container = typeof WeakMap === "function" ? WeakMap : function<KeyType, ValueType>() {
    var array: (KeyType | ValueType)[] = [];

    this.get = function(key: KeyType) {
        for (var i = array.length - 2; i >= 0; i -= 2) {
            if (array[i] === key) {
                return array[i + 1];
            }
        }
        return undefined;
    };

    this.set = function(key: KeyType, value: ValueType) {
        for (var i = array.length - 2; i >= 0; i -= 2) {
            if (array[i] === key) {
                array[i + 1] = value;
                return;
            }
        }
        array.push(key, value);
    };
} as unknown as WeakMapConstructor;

function createInjector(
    parent: Injector | null,
    handleMissingProvider: ((token: TokenClass) => InstanceOf<TokenClass>) | null
): Injector {
    return {
        container: new Container<TokenLike, Provider<unknown>>(),
        handleMissingProvider: handleMissingProvider,
        parent: parent
    };
}

export default createInjector;
