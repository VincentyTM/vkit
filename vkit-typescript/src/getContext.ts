import { getComponent, getInjector, setComponent, setInjector } from "./contextGuard.js";
import throwError from "./throwError.js";
import type { View } from "./view.js";

export default function getContext<ContextT>(): (getView: () => View<ContextT>) => View<ContextT> {
	var component = getComponent();
	var injector = getInjector();
	
	return function(getView: () => View<ContextT>): View<ContextT> {
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
