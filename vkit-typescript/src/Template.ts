import { Bindings } from "./bind.js";
import { Signal } from "./signal.js";

export type Template<ContextT = unknown> = (
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| ArrayLike<Template<ContextT>>
	| Omit<Bindings<ContextT>, number>
	| Generator<Template<ContextT>, Template<ContextT>>
	| Signal<unknown>
	| ((element: ContextT) => void)
);
