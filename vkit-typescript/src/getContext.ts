import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { throwError } from "./throwError.js";
import { Template } from "./Template.js";

export function getContext<ContextT>(): (getView: () => Template<ContextT>) => Template<ContextT> {
	var effect = getEffect();
	var injector = getInjector();
	
	return function(getView: () => Template<ContextT>): Template<ContextT> {
		var previousEffect = getEffect(true);
		var previousInjector = getInjector(true);
		
		try {
			setEffect(effect);
			setInjector(injector);
			return getView();
		} catch (error) {
			throwError(error, effect);
		} finally {
			setEffect(previousEffect);
			setInjector(previousInjector);
		}
	};
}
