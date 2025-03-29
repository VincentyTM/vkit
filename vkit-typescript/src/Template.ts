import { Bindings } from "./bind.js";
import { Signal } from "./computed.js";
import { ServerElement } from "./createServerElement.js";
import { Pushable } from "./deepPush.js";

export interface CustomTemplate<P> {
	clientRender(
		array: Pushable<Template<P>>,
		template: CustomTemplate<P>,
		context: unknown,
		crossView: boolean
	): void;

	serverRender(
		serverElement: ServerElement,
		template: CustomTemplate<P>
	): void;
}

export type Template<P = unknown> = (
	| Node
	| string
	| number
	| bigint
	| boolean
	| null
	| undefined
	| ArrayLike<Template<P>>
	| Bindings<P>
	| Generator<Template<P>, Template<P>>
	| Signal<string | number | bigint | boolean>
	| (() => string | number | bigint | boolean)
	| CustomTemplate<P>
);
