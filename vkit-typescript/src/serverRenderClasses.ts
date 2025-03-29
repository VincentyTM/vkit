import { BooleanValue, ClassArgument, ClassesTemplate, NoClass } from "./classes.js";
import { ServerElement } from "./createServerElement.js";
import { isArrayLike } from "./isArrayLike.js";
import { isSignal } from "./isSignal.js";

export function serverRenderClasses(serverElement: ServerElement, template: ClassesTemplate): void {
	bindClasses(serverElement, template.args);
}

function addClass(el: ServerElement, name: string): void {
    var attributes = el.attributes;

    if (attributes.className) {
        attributes.className += " " + name;
    } else {
        attributes.className = name;
    }
}

function removeClass(el: ServerElement, name: string): void {
    var attributes = el.attributes;
    var className = attributes.className;

    if (className === name) {
        delete attributes.className;
    } else {
        attributes.className = className.replace(" " + name, "");

        if (className.indexOf(name + " ") === 0) {
            attributes.className = attributes.className.substring(name.length + 1);
        }
    }
}

function bindClass(el: ServerElement, name: string, value: BooleanValue): void {
	if (isSignal(value)) {
		value() ? addClass(el, name) : removeClass(el, name);
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
		bindClass(el, name, value());
		return;
	}
}

function bindClasses(el: ServerElement, arg: ClassArgument): void {
	if (arg === null || arg === undefined || arg === true || arg === false) {
		return;
	}
	
	if (typeof arg === "string") {
		addClass(el, arg);
		return;
	}
	
	if (isArrayLike(arg)) {
		var n = arg.length;
		for (var i = 0; i < n; ++i) {
			bindClasses(el, arg[i]);
		}
		return;
	}
	
	if (isSignal(arg) || typeof arg === "function") {
		bindClasses(el, arg());
		return;
	}
	
	if (typeof arg === "object") {
		for (var name in arg) {
			bindClass(el, name, arg[name]);
		}
		return;
	}
}
