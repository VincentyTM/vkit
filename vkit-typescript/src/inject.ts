import {getInjector} from "./contextGuard";
import {Injector, InstanceOf, TokenClass, TokenLike} from "./injector";
import {Provider} from "./provider";

/**
 * This method can be used to inject a service instance instead of passing it as a parameter.
 * 
 * It traverses the injector tree upwards to find the nearest provider of a service.
 * If none can be found, a service provider is created in the root injector instead.
 * The method then creates a service instance for the service provider if no instance exists in the provider yet and returns it.
 * If it does exist, the method returns the existing instance.
 * @example
 * class MyService {
 * 	name = "world";
 * }
 * 
 * function MyComponent() {
 * 	const myService1 = inject(MyService);
 * 	const myService2 = inject(MyService);
 * 	
 * 	// myService1 === myService2
 * 	
 * 	return H1("Hello ", myService1.name);
 * }
 * @param token Used as a key to find a provider of the service.
 * @param injector An optional injector to start the search of the provider. By default, it is the current injector.
 * @returns An instance of the injectable service.
 */
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
