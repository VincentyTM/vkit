import { Bindings } from "./bind.js";
import { Signal } from "./computed.js";
import { createEffect } from "./createEffect.js";
import { ClientRendererBase } from "./deepPush.js";
import { hydrateInlineStyle } from "./hydrateInlineStyle.js";
import { InlineStyleInput } from "./inlineStyle.js";
import { isCustomTemplate } from "./isCustomTemplate.js";
import { isSignal } from "./isSignal.js";
import { onEvent, EventListenerType } from "./onEvent.js";
import { Template } from "./Template.js";
import { updateEffect } from "./updateEffect.js";

export interface HydrationPointer<P> extends ClientRendererBase<P> {
	currentNode: Node | null;
	readonly stopNode: Node | null;
}

interface ParentNodeCore {
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLParagraphElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	insertBefore<T extends ParentNodeCore>(node: T, child: ParentNodeCore | null): T;
	insertBefore<T extends Node>(node: T, child: Node | null): T;
}

export function hydrate<P extends ParentNodeCore>(pointer: HydrationPointer<P>, template: Template<P>): void {
	if (template === null || template === undefined || template === true || template === false) {
		return;
	}
	
	if (typeof template === "string" || typeof template === "number" || typeof template === "bigint") {
		hydrateText(pointer, String(template));
		return;
	}
	
	if (isSignal(template)) {
		hydrateDynamicSignalText(pointer, template);
		return;
	}
	
	if (typeof template === "function") {
		hydrateDynamicText(pointer, template);
		return;
	}

    if (isCustomTemplate(template)) {
		template.hydrate(pointer, template);
		return;
    }
	
	if ("nodeType" in template) {
		pointer.context.insertBefore(template, pointer.currentNode);
		return;
	}
	
	if ("length" in template) {
		var n = template.length;
		
		for (var i = 0; i < n; ++i) {
			hydrate(pointer, template[i]);
		}
		
		return;
	}
	
    if ("next" in template) {
        var x: IteratorResult<Template<P>, Template<P>>;

        do {
            x = template.next();
            hydrate(pointer, x.value);
        } while (!x.done);

        return;
    }
	
	hydrateBindings(pointer, template);
}

function hydrateText(pointer: HydrationPointer<ParentNodeCore>, text: string): Text {
	var current = pointer.currentNode;
	
	if (current && current.nodeType === 3 && current !== pointer.stopNode) {
		current.nodeValue = text;
		pointer.currentNode = current.nextSibling;
		return current as Text;
	} else {
		var node = document.createTextNode(text);
		pointer.context.insertBefore(node, current);
		return node;
	}
}

function hydrateDynamicText(pointer: HydrationPointer<ParentNodeCore>, template: () => string | number | bigint | boolean): void {
	var node: Text | undefined;
	var parentEffect = pointer.parentEffect;

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		if (node) {
			node.nodeValue = String(template());
		} else {
			node = hydrateText(pointer, String(template()));
		}
	});

	updateEffect(effect);
}

function hydrateDynamicSignalText(pointer: HydrationPointer<ParentNodeCore>, template: Signal<string | number | bigint | boolean>): void {
	var node: Text | undefined;
	var parentEffect = pointer.parentEffect;

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		if (node) {
			node.nodeValue = String(template());
		} else {
			node = hydrateText(pointer, String(template()));
		}
	});

	updateEffect(effect);
}

function hydrateBindings<P>(pointer: HydrationPointer<P>, bindings: Bindings<P>): void {
	for (var key in bindings) {
		var k = key as string & keyof Bindings<P>;
		hydrateBinding(pointer, k, bindings[k]);
	}
}

function hydrateBinding<P, K extends string & keyof Bindings<P>>(
	pointer: HydrationPointer<P>,
	key: K,
	value: Bindings<P>[K]
): void {
	if (value === undefined) {
		return;
	}

	if (key === "style") {
		hydrateInlineStyle(pointer as never, {
			styleProperties: value as InlineStyleInput
		});
		return;
	}

	if (isSignal(value)) {
		hydrateSignalBinding(pointer, key, value as Signal<P[K]>);
		return;
	}
	
	if (typeof value === "function") {
		if (key.indexOf("on") === 0) {
			var element = pointer.context;

			if (!(element && (element as any).nodeType === 1)) {
				throw new Error("Event listener can only be attached to an element");
			}

			onEvent(
				element as unknown as Element,
				key.substring(2),
				value as EventListenerType
			);
		} else {
			hydrateFunctionBinding(pointer, key, value as () => P[keyof P]);
		}
		return;
	}
	
	hydrateStaticBinding(pointer, key, value as P[K]);
}

function hydrateFunctionBinding<P, K extends keyof P>(
	pointer: HydrationPointer<P>,
	key: K,
	value: () => P[K]
): void {
	var element = pointer.context;
	var parentEffect = pointer.parentEffect;

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		element[key] = value();
	});

	updateEffect(effect);
}

function hydrateSignalBinding<P, K extends keyof P>(pointer: HydrationPointer<P>, key: K, value: Signal<P[K]>): void {
	var element = pointer.context;
	var parentEffect = pointer.parentEffect;

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		element[key] = value();
	});

	updateEffect(effect);
}

function hydrateStaticBinding<P, K extends keyof P>(pointer: HydrationPointer<P>, key: K, value: P[K]): void {
	var element = pointer.context;
	var parentEffect = pointer.parentEffect;

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		element[key] = value;
	});

	updateEffect(effect);
}
