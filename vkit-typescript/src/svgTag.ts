import { clientRenderSVGElement } from "./clientRenderSVGElement.js";
import { Signal } from "./signal.js";
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
	| ((element: ContextT) => void)
);

export interface SVGElementTemplate<N extends keyof SVGElementTagNameMap> extends CustomTemplate<SVGElementTagNameMap[N]> {
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
export function svgTag<N extends keyof SVGElementTagNameMap>(tagName: N): (
	...contents: SVGView<SVGElementTagNameMap[N]>[]
) => SVGElementTemplate<N> {
	return function(): SVGElementTemplate<N> {
		return {
			child: arguments as SVGView<SVGElementTagNameMap[N]>,
			tagName: tagName,
			clientRender: clientRenderSVGElement
		};
	};
}
