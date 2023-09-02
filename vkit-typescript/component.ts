import emitUnmount from "./emitUnmount";
import {getComponent, getInjector, setComponent, setInjector} from "./contextGuard";
import throwError from "./throwError";

import type {Observable} from "./observable";
import type {Injector} from "./injector";

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
	injector?: Injector | null
) : Component {
	var component = {
		children: null,
		emitError: null,
		parent: parent === undefined ? getComponent() : parent,
		render: renderComponent,
		unmount: null
	};
	
	if( injector === undefined ){
		injector = getInjector();
	}
	
	function renderComponent(){
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try{
			setComponent(null);
			emitUnmount(component);
			setComponent(component);
			setInjector(injector || null);
			mount();
		}catch(error){
			throwError(error, component);
		}finally{
			setComponent(prevComponent);
			setInjector(prevInjector);
		}
	}
	
	return component;
}

export type {Component};

export default createComponent;
