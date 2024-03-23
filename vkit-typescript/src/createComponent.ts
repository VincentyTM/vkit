import emitUnmount from "./emitUnmount.js";
import {getComponent, getInjector, setComponent, setInjector} from "./contextGuard.js";
import type {Injector} from "./injector.js";
import type {Observable} from "./observable.js";
import throwError from "./throwError.js";

export type Component = {
	children: Component[] | null;
	emitError: ((error: any) => void) | null;
	parent: Component | null;
	render: () => void;
	stack: string | undefined;
	unmount: Observable<void> | null;
};

export default function createComponent(
	mount: () => void,
	parent?: Component | null,
	injector?: Injector | null
) : Component {
	var component = {
		children: null,
		emitError: null,
		parent: parent === undefined ? getComponent() : parent,
		render: renderComponent,
		stack: new Error().stack,
		unmount: null
	};
	
	if (injector === undefined) {
		injector = getInjector();
	}
	
	function renderComponent(): void {
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try {
			setComponent(null);
			emitUnmount(component);
			setComponent(component);
			setInjector(injector || null);
			mount();
		} catch (error) {
			throwError(error, component);
		} finally {
			setComponent(prevComponent);
			setInjector(prevInjector);
		}
	}
	
	return component;
}
