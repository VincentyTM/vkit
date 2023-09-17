import {getComponent, getInjector, setComponent, setInjector} from "./contextGuard";
import throwError from "./throwError";
import {View} from "./view";

export default function context(): (getView: () => View) => View {
	var component = getComponent();
	var injector = getInjector();
	
	return function(getView: () => View): View {
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

		return;
	};
}
