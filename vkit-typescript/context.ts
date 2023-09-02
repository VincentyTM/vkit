import {getComponent, getInjector, setComponent, setInjector} from "./contextGuard";
import throwError from "./throwError";
import {View} from "./view";

function getContext(){
	var component = getComponent();
	var injector = getInjector();
	
	return function(getView: () => View){
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try{
			setComponent(component);
			setInjector(injector);
			
			return getView.apply(this, arguments);
		}catch(error){
			throwError(error, component);
		}finally{
			setComponent(prevComponent);
			setInjector(prevInjector);
		}
	};
}

export default getContext;
