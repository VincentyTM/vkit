import { Bindings } from "./bind.js";
import { Signal } from "./computed.js";
import { Pushable } from "./deepPush.js";

export interface CustomTemplate<P> {
	clientRender(
		array: Pushable<Template<P>>,
		template: CustomTemplate<P>,
		context: unknown,
		crossView: boolean
	): void;
}

export type Template<P = unknown> = (
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| ArrayLike<Template<P>>
	| Bindings<P>
	| Generator<Template<P>, Template<P>>
	| Signal<unknown>
	| CustomTemplate<P>
	| ((element: P) => void)
);
