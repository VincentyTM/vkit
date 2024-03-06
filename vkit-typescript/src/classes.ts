import effect from "./effect.js";
import isArray from "./isArray.js";
import onUnmount from "./onUnmount.js";
import type {Signal} from "./signal.js";

type BooleanValue = boolean | Signal<boolean> | (() => boolean);
type ClassArgument = (
	string |
	NoClass |
	Signal<string | NoClass> |
	(() => string | NoClass) |
	ArrayLike<ClassArgument> |
	{[className: string]: BooleanValue}
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
	if (value && typeof (value as Signal<boolean>).effect === "function") {
		(value as Signal<boolean>).effect(function(v) {
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
	var type = typeof arg;
	
	if (!arg) {
		return;
	}
	
	if (isArray(arg)) {
		var n = (arg as ArrayLike<ClassArgument>).length;
		for (var i = 0; i < n; ++i) {
			bindClasses(el, (arg as ArrayLike<ClassArgument>)[i], onCleanup);
		}
		return;
	}
	
	if (type === "string") {
		addClass(el, arg as string);
		if (onCleanup) {
			onCleanup(function() {
				removeClass(el, arg as string);
			});
		}
		return;
	}
	
	if (typeof (arg as Signal<ClassArgument>).effect === "function") {
		(arg as Signal<ClassArgument>).effect(function(value: ClassArgument, onCleanup?: CleanupFunction) {
			bindClasses(el, value, onCleanup);
		});
		return;
	}
	
	if (type === "object") {
		for (var name in arg as {[className: string]: BooleanValue}) {
			bindClass(el, name, (arg as {[className: string]: BooleanValue})[name]);
		}
		return;
	}
	
	if (type === "function") {
		effect(function() {
			bindClasses(el, (arg as () => ClassArgument)(), onUnmount);
		});
		return;
	}
}

export default function classes(...args: ClassArgument[]): (element: HTMLElement) => void;

export default function classes() {
	var args = arguments;
	var n = args.length;
	
	return function(element: HTMLElement) {
		for (var i = 0; i < n; ++i) {
			bindClasses(element, args[i]);
		}
	};
}
