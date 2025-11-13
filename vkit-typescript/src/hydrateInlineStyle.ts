import { Signal } from "./computed.js";
import { createEffect, Effect } from "./createEffect.js";
import { HydrationPointer } from "./hydrate.js";
import { isSignal } from "./isSignal.js";
import { updateEffect } from "./updateEffect.js";

export type InlineStyleInput = {
	[K in WritableCSSStyleDeclaration]?: (
		| WritableCSSStyleDeclaration[K]
		| Signal<WritableCSSStyleDeclaration[K]>
		| (() => WritableCSSStyleDeclaration[K])
	);
};

interface InlineStyleTemplateInternals {
	styleProperties: InlineStyleInput;
}

type Writable<T> = {
	[K in keyof T]-?: T[K] extends Readonly<T[K]> ? never : K;
}[keyof T];

type WritableCSSStyleDeclaration = Writable<CSSStyleDeclaration>;

export function hydrateInlineStyle(pointer: HydrationPointer<ElementCSSInlineStyle>, template: InlineStyleTemplateInternals): void {
	var props = template.styleProperties;
	var style = pointer.context.style;

	for (var key in props) {
		var value = props[key as keyof InlineStyleInput];

		if (isSignal(value) || typeof value === "function") {
			hydrateDynamicStyleProperty(
				pointer.parentEffect,
				style,
				key as keyof CSSStyleDeclaration,
				value
			);
		} else {
			style[key as keyof InlineStyleInput] = value;
		}
	}
}

function hydrateDynamicStyleProperty<K extends keyof CSSStyleDeclaration>(
	parentEffect: Effect,
	style: CSSStyleDeclaration,
	key: K,
	value: Signal<CSSStyleDeclaration[K]> | (() => CSSStyleDeclaration[K])
): void {
	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		style[key] = value();
	});
	updateEffect(effect);
}
