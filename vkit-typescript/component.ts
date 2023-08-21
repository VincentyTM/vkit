import emitUnmount from "./emitUnmount";
import {getComponent, getProvider, setComponent, setProvider} from "./contextGuard";
import throwError from "./throwError";

import type {Observable} from "./observable";
import type {Provider} from "./inject";

type Component = {
	children: Component[] | null,
	emitError: ((error: any) => void) | null,
	parent: Component | null,
	render: () => void,
	unmount: Observable<void> | null
};

function createComponent(
	mount: () => void,
	parent?: Component | null,
	provider?: Provider | null
) : Component {
	var component = {
		children: null,
		emitError: null,
		parent: parent === undefined ? getComponent() : parent,
		render: renderComponent,
		unmount: null
	};
	
	if( provider === undefined ){
		provider = getProvider();
	}
	
	function renderComponent(){
		var prevComponent = getComponent(true);
		var prevProvider = getProvider(true);
		
		try{
			setComponent(null);
			emitUnmount(component);
			setComponent(component);
			setProvider(provider || null);
			mount();
		}catch(error){
			throwError(error, component);
		}finally{
			setComponent(prevComponent);
			setProvider(prevProvider);
		}
	}
	
	return component;
}

export type {Component};

export default createComponent;
