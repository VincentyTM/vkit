import emitUnmount from "./emitUnmount";
import {getComponent, getInjector, setComponent, setInjector} from "./contextGuard";
import {Injector} from "./injector";
import {Observable} from "./observable";
import throwError from "./throwError";

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
