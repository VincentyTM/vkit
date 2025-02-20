import { emitUnmount } from "./emitUnmount.js";
import { getComponent, getInjector, setComponent, setInjector } from "./contextGuard.js";
import type { Injector } from "./createInjector.js";
import type { Observable } from "./observable.js";
import { throwError } from "./throwError.js";

export type Component = {
	children: Component[] | null;
	errorHandlers: ((error: unknown) => void)[] | null;
	parent: Component | null;
	render: () => void;
	stack: string | undefined;
	unmount: Observable<void> | null;
};

export function createComponent(
	mount: () => void,
	parent?: Component | null,
	injector?: Injector | null
) : Component {
	var isRendering = false;
	
	var component = {
		children: null,
		errorHandlers: null,
		parent: parent === undefined ? getComponent() : parent,
		render: renderComponent,
		stack: new Error().stack,
		unmount: null
	};
	
	if (injector === undefined) {
		injector = getInjector();
	}
	
	function renderComponent(): void {
		if (isRendering) {
			throwError(new Error("Circular dependency detected"), component.parent);
		}
		
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try {
			isRendering = true;
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
			isRendering = false;
		}
	}
	
	return component;
}
