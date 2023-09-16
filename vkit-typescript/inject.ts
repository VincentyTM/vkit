import {getInjector} from "./contextGuard";
import {Injector, InstanceOf, TokenClass, TokenLike} from "./injector";
import {Provider} from "vkit/vkit-typescript/provider";

function inject<TokenType extends TokenLike>(token: TokenType, injector?: Injector): InstanceOf<TokenType> {
	if (!injector) {
		injector = getInjector()!;
	}
	
	var provider: Provider<InstanceOf<TokenType>> | undefined;
	
	while (!(provider = injector!.container.get(token) as Provider<InstanceOf<TokenType>>)) {
		var handleMissingProvider = injector!.handleMissingProvider;
		var parent: Injector | null = injector!.parent;
		
		if (!parent) {
			if (typeof handleMissingProvider === "function") {
				return handleMissingProvider(token as TokenClass) as InstanceOf<TokenType>;
			}
			throw new Error("There is no provider for this token");
		}
		
		injector = parent;
	}
	
	return provider.getInstance();
}

export default inject;
