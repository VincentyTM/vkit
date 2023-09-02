import {getInjector} from "./contextGuard";
import {InstanceOf, TokenLike} from "./injector";

function inject<TokenType extends TokenLike>(token: TokenType): InstanceOf<TokenType> {
    return getInjector()!.inject<TokenType>(token);
}

export default inject;
