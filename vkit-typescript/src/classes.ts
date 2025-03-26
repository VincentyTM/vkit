import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { isArray } from "./isArray.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";

type BooleanValue = boolean | Signal<boolean> | (() => boolean);
type ClassArgument = (
	| string
	| NoClass
	| Signal<string | NoClass>
	| (() => string | NoClass)
	| ClassArgument[]
	| {[className: string]: BooleanValue}
);
type CleanupFunction = (callback: () => void) => void;
type NoClass = null | undefined | boolean;

function addClass(el: HTMLElement, name: string): void {
	if (el.classList) {
		el.classList.add(name);
	} else {
		el.className += " " + name;
	}
}

function removeClass(el: HTMLElement, name: string): void {
	if (el.classList) {
		el.classList.remove(name);
	} else {
		el.className = el.className.replace(" " + name, "");
	}
}

function bindClass(el: HTMLElement, name: string, value: BooleanValue): void {
	if (isSignal(value)) {
		value.effect(function(v) {
			v ? addClass(el, name) : removeClass(el, name);
		});
		return;
	}
	
	if (value === true) {
		addClass(el, name);
		return;
	}
	
	if (value === false) {
		removeClass(el, name);
		return;
	}
	
	if (typeof value === "function") {
		effect(function() {
			bindClass(el, name, value());
		});
		return;
	}
}

function bindClasses(el: HTMLElement, arg: ClassArgument, onCleanup?: CleanupFunction): void {
	if (!arg) {
		return;
	}
	
	if (isArray(arg)) {
		var n = arg.length;
		for (var i = 0; i < n; ++i) {
			bindClasses(el, arg[i], onCleanup);
		}
		return;
	}
	
	if (typeof arg === "string") {
		addClass(el, arg);
		if (onCleanup) {
			onCleanup(function() {
				removeClass(el, arg);
			});
		}
		return;
	}
	
	if (isSignal(arg)) {
		arg.effect(function(value: ClassArgument, onCleanup?: CleanupFunction) {
			bindClasses(el, value, onCleanup);
		});
		return;
	}
	
	if (typeof arg === "object") {
		for (var name in arg) {
			bindClass(el, name, arg[name]);
		}
		return;
	}
	
	if (typeof arg === "function") {
		effect(function() {
			bindClasses(el, arg(), onDestroy);
		});
		return;
	}
}

export function classes(...args: ClassArgument[]): (element: HTMLElement) => void;

/**
 * Creates a class collection that can be bound to one or more HTML elements.
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
 * @returns A directive that binds the classes to an HTML element.
 */
export function classes(): (element: HTMLElement) => void {
	var args = arguments;
	var n = args.length;
	
	return function(element: HTMLElement): void {
		for (var i = 0; i < n; ++i) {
			bindClasses(element, args[i]);
		}
	};
}
