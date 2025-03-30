import { BooleanValue, ClassArgument, ClassesTemplate, NoClass } from "./classes.js";
import { Pushable } from "./deepPush.js";
import { effect } from "./effect.js";
import { isArrayLike } from "./isArrayLike.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { Template } from "./Template.js";

export function clientRenderClasses<P extends Element>(
	_array: Pushable<Template<P>>,
	template: ClassesTemplate,
	context: P,
    crossView: boolean
): void {
	bindClasses(context, template.args, crossView);
}

function addClass(el: Element, name: string): void {
	if (el.classList) {
		el.classList.add(name);
	} else {
		el.className += " " + name;
	}
}

function removeClass(el: Element, name: string): void {
	if (el.classList) {
		el.classList.remove(name);
	} else {
		el.className = el.className.replace(" " + name, "");
	}
}

function bindClass(el: Element, name: string, value: BooleanValue): void {
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

function bindClasses(el: Element, arg: ClassArgument, crossView: boolean): void {
	if (arg === null || arg === undefined || arg === true || arg === false) {
		return;
	}
	
	if (typeof arg === "string") {
		addClass(el, arg);

		if (crossView) {
			onDestroy(function(): void {
				removeClass(el, arg);
			});
		}

		return;
	}
	
	if (isArrayLike(arg)) {
		var n = arg.length;
		for (var i = 0; i < n; ++i) {
			bindClasses(el, arg[i], crossView);
		}
		return;
	}
	
	if (isSignal(arg)) {
		arg.effect(function(value: string | NoClass): void {
			bindClasses(el, value, true);
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
		effect(function(): void {
			bindClasses(el, arg(), true);
		});
		return;
	}
}
