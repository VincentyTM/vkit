import { BooleanValue, ClassArgument, ClassesTemplate, NoClass } from "./classes.js";
import { createEffect, Effect } from "./createEffect.js";
import { ClientRenderer } from "./hydrate.js";
import { isArrayLike } from "./isArrayLike.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { updateEffect } from "./updateEffect.js";

export function clientRenderClasses<P extends Element>(
	clientRenderer: ClientRenderer<P>,
	template: ClassesTemplate
): void {
	bindClasses(
		clientRenderer.parentEffect,
		clientRenderer.context,
		template.args,
		false
	);
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

function bindClass(
	parentEffect: Effect,
	el: Element,
	name: string,
	value: BooleanValue
): void {
	if (isSignal(value) || typeof value === "function") {
		var effect = createEffect(parentEffect, parentEffect.injector, function() {
			bindClass(parentEffect, el, name, value());
		});
		updateEffect(effect);
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
}

function bindClasses(
	parentEffect: Effect,
	el: Element,
	arg: ClassArgument,
	callOnDestroy: boolean
): void {
	if (arg === null || arg === undefined || arg === true || arg === false) {
		return;
	}
	
	if (typeof arg === "string") {
		addClass(el, arg);

		if (callOnDestroy) {
			onDestroy(function() {
				removeClass(el, arg);
			});
		}

		return;
	}
	
	if (isSignal(arg) || typeof arg === "function") {
		var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
			bindClasses(parentEffect, el, arg(), true);
		});
		updateEffect(effect);
		return;
	}
	
	if (isArrayLike(arg)) {
		var n = arg.length;
		for (var i = 0; i < n; ++i) {
			bindClasses(parentEffect, el, arg[i], callOnDestroy);
		}
		return;
	}
	
	if (typeof arg === "object") {
		for (var name in arg) {
			bindClass(parentEffect, el, name, arg[name]);
		}
		return;
	}
}
