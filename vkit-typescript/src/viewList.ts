import { clientRenderViewList } from "./clientRenderViewList.js";
import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { serverRenderViewList } from "./serverRenderViewList.js";
import { CustomTemplate, Template } from "./Template.js";

export interface ViewListTemplate<T, P> extends CustomTemplate<P> {
	readonly models: Signal<ArrayLike<T>>;
	readonly parentEffect: Effect;
	getItemTemplate(model: T): Template<P>;
}

export function viewList<T, P>(
	models: Signal<ArrayLike<T>>,
	getItemTemplate: (model: T) => Template<P>
): ViewListTemplate<T, P> {
	return {
		models: models,
		parentEffect: getEffect(),
		clientRender: clientRenderViewList,
		getItemTemplate: getItemTemplate,
		serverRender: serverRenderViewList
	};
}
