import {getInjector, setInjector} from "./contextGuard.js";

export default function getContext() {
	var injector = getInjector();
	
	return function(getView) {
		var prevInjector = getInjector(true);
		
		try {
			setInjector(injector);
			return getView.apply(this, arguments);
		} finally {
			setInjector(prevInjector);
		}
	};
}
