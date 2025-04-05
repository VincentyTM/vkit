import { BooleanValue, ClassArgument, ClassesTemplate, NoClass } from "./classes.js";
import { ClientRendererBase } from "./deepPush.js";
import { effect } from "./effect.js";
import { isArrayLike } from "./isArrayLike.js";
import { isSignal } from "./isSignal.js";

export function clientRenderClasses<P extends Element>(
	clientRenderer: ClientRendererBase<P>,
	template: ClassesTemplate
): void {
	bindClasses(clientRenderer.context, template.args);
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

function bindClasses(el: Element, arg: ClassArgument): void {
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
	
	if (isSignal(arg)) {
		arg.effect(function(value: string | NoClass): void {
			bindClasses(el, value);
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
			bindClasses(el, arg());
		});
		return;
	}
}
