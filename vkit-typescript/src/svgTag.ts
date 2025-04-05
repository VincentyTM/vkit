import { clientRenderSVGElement } from "./clientRenderSVGElement.js";
import { Signal } from "./computed.js";
import { hydrateSVGElement } from "./hydrateSVGElement.js";
import { serverRenderSVGElement } from "./serverRenderSVGElement.js";
import { CustomTemplate, Template } from "./Template.js";

export type Reactive<T> = T | Signal<T> | (() => T);

type ExtendedEvent<E, T> = E & {
	readonly currentTarget: T;
	readonly target: E extends Event ? E["target"] : EventTarget;
};

type SVGAttributes = {
	[N: string]: any;
};

type SVGBindingsRecursive<T> = {
	[K in keyof T]?: Reactive<T[K]> | SVGBindingsRecursive<T[K]>;
};

type SVGBindings<T> = {
	[K in keyof T]?: (
		T[K] extends ((this: GlobalEventHandlers, ev: infer EventType) => any) | null ?
		(this: T, ev: ExtendedEvent<EventType, T>) => void :

		T[K] extends SVGAnimatedLength ?
		Reactive<string | number> :

		SVGBindingsRecursive<T[K]>
	);
} & SVGAttributes;

export type SVGView<ContextT = unknown> = (
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| ArrayLike<SVGView<ContextT>>
	| SVGBindings<ContextT>
	| Generator<SVGView<ContextT>, SVGView<ContextT>>
	| Signal<unknown>
	| (() => string | number)
);

export interface SVGElementTemplate<N extends keyof SVGElementTagNameMap> extends CustomTemplate<unknown> {
	readonly child: Template<SVGElementTagNameMap[N]>;
	readonly tagName: N;
}

/**
 * Creates and returns an SVG tag (element factory).
 * SVG element names and attributes are case sensitive.
 * For a shorter syntax see `svgTags`.
 * @example
 * const Svg = svgTag("svg");
 * const Circle = svgTag("circle");
 * 
 * function Component() {
 * 	return Svg(
 * 		{
 * 			width: 100,
 * 			height: 100,
 * 			viewBox: "0 0 100 100"
 * 		},
 * 
 * 		Circle({
 * 			cx: 50,
 * 			cy: 50,
 * 			r: 50,
 * 			fill: "#ff0000"
 * 		})
 * 	);
 * }
 */
export function svgTag<N extends keyof SVGElementTagNameMap>(tagName: N): (...children: Template<SVGElementTagNameMap[N]>[]) => SVGElementTemplate<N>;

export function svgTag<N extends keyof SVGElementTagNameMap>(tagName: N): () => SVGElementTemplate<N> {
	return function(): SVGElementTemplate<N> {
		return {
			child: arguments.length > 1 ? arguments : arguments[0],
			tagName: tagName,
			clientRender: clientRenderSVGElement,
			hydrate: hydrateSVGElement,
			serverRender: serverRenderSVGElement
		};
	};
}
