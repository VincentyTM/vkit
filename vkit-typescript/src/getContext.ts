import { getComponent, getInjector, setComponent, setInjector } from "./contextGuard.js";
import { throwError } from "./throwError.js";
import { Template } from "./Template.js";

export function getContext<ContextT>(): (getView: () => Template<ContextT>) => Template<ContextT> {
	var component = getComponent();
	var injector = getInjector();
	
	return function(getView: () => Template<ContextT>): Template<ContextT> {
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try {
			setComponent(component);
			setInjector(injector);
			return getView();
		} catch (error) {
			throwError(error, component);
		} finally {
			setComponent(prevComponent);
			setInjector(prevInjector);
		}
	};
}
