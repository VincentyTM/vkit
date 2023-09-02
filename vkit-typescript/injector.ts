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
    inject<TokenType extends TokenLike>(token: TokenType): InstanceOf<TokenType>;
    set(token: TokenLike, provider: Provider<unknown>): void;
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
            if ( array[i] === key ){
                array[i + 1] = value;
                return;
            }
        }
        array.push(key, value);
    };
} as unknown as WeakMapConstructor;

function createInjector(parent: Injector | null, handleMissingProvider: ((token: TokenClass) => InstanceOf<TokenClass>) | null): Injector {
    var container = new Container<TokenLike, Provider<unknown>>();
    
    function inject<TokenType extends TokenLike>(token: TokenType): InstanceOf<TokenType> {
        var provider = container.get(token);
        if (provider) {
            return provider.getInstance() as InstanceOf<TokenType>;
        } else {
            if (!parent) {
                if (typeof handleMissingProvider === "function") {
                    return handleMissingProvider(token as TokenClass) as InstanceOf<TokenType>;
                }
                throw new Error("Value not provided anywhere");
            }
            return parent.inject<TokenType>(token);
        }
    }

    function set(token: TokenLike, provider: Provider<unknown>) {
        container.set(token, provider);
    }

    return {
        inject: inject,
        set: set
    };
}

export default createInjector;
