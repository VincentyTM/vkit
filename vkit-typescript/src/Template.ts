import { Bindings } from "./bind.js";
import { Pushable } from "./deepPush.js";
import { Signal } from "./signal.js";

export interface CustomTemplate<P> {
	clientRender(
		array: Pushable<P>,
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
	| Omit<Bindings<P>, number>
	| Generator<Template<P>, Template<P>>
	| Signal<unknown>
	| CustomTemplate<P>
	| ((element: P) => void)
);
