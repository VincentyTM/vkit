import { emitUnmount } from "./emitUnmount.js";
import { getComponent, getInjector, setComponent, setInjector } from "./contextGuard.js";
import { Injector } from "./createInjector.js";
import { throwError } from "./throwError.js";

export interface Component {
	children: Component[] | null;
	destroyHandlers: (() => void)[] | undefined;
	errorHandlers: ((error: unknown) => void)[] | null;
	parent: Component | null;
	stack: string | undefined;
	render(): void;
}

export function createComponent(
	mount: () => void,
	parent?: Component | null,
	injector?: Injector | null
) : Component {
	var isRendering = false;
	
	var component = {
		children: null,
		destroyHandlers: undefined,
		errorHandlers: null,
		parent: parent === undefined ? getComponent() : parent,
		stack: new Error().stack,
		render: renderComponent
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
