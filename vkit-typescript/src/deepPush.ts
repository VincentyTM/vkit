import { Effect } from "./createEffect.js";

export interface ClientRendererBase<P> {
	readonly context: P;
	readonly parentEffect: Effect;
}
