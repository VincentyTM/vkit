import { clientRenderClasses } from "./clientRenderClasses.js";
import { Signal } from "./computed.js";
import { serverRenderClasses } from "./serverRenderClasses.js";
import { CustomTemplate } from "./Template.js";

export type BooleanValue = boolean | Signal<boolean> | (() => boolean);

export type ClassArgument = (
	| string
	| NoClass
	| Signal<string | NoClass>
	| (() => string | NoClass)
	| ArrayLike<ClassArgument>
	| Record<string, BooleanValue | undefined>
);

export type NoClass = null | undefined | boolean;

export interface ClassesTemplate extends CustomTemplate<Element> {
	readonly args: ClassArgument;
}

/**
 * Creates a class collection that can be bound to one or more elements.
 * The classes can be static strings or dynamic signals or functions.
 * Objects with class name keys and boolean values can also be used to add multiple classes.
 * Functions can be used to dynamically switch between multiple classes.
 * The classes can be arbitrarily grouped by arrays.
 * @example
 * Div(
 * 	classes("class1", "class2"),
 * 	
 * 	classes({
 * 		class3: false,
 * 		class4: true,
 * 		class5: () => shouldClass5BeAdded()
 * 	}),
 * 	
 * 	classes(["class6", "class7"]),
 * 	
 * 	classes(() => shouldClass8BeUsed() ? "class8" : ["class9", "class10"]),
 * 	
 * 	classes(() => shouldClass11BeUsed() && "class11")
 * )
 * 
 * @returns A directive that binds the classes to an element.
 */
export function classes(...args: readonly ClassArgument[]): ClassesTemplate;

export function classes(): ClassesTemplate {
	return {
		args: arguments.length > 1 ? arguments : arguments[0],
		hydrate: clientRenderClasses,
		serverRender: serverRenderClasses
	};
}
