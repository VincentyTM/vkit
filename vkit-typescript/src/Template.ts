import { Bindings } from "./bind.js";
import { Signal } from "./computed.js";
import { ServerElement } from "./createServerElement.js";
import { ClientRenderer } from "./deepPush.js";
import { HydrationPointer } from "./hydrate.js";

export interface CustomTemplate<P> {
	clientRender(clientRenderer: ClientRenderer<P>, template: CustomTemplate<P>): void;
	hydrate(pointer: HydrationPointer<P>, template: CustomTemplate<P>): void;
	serverRender(serverElement: ServerElement, template: CustomTemplate<P>): void;
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
