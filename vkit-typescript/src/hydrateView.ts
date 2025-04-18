import { getEffect } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function hydrateView<P extends ParentNode>(pointer: HydrationPointer<P>, view: ViewTemplate<unknown, P>): void {
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	var parentEffect = view.parentEffect;
	
	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var innerTemplate = view.getTemplate(view.signal ? view.signal.get() : null);
		var parentNode = pointer.context;
		var parent = end.parentNode;
		
		if (parent && start.nextSibling) {
			for (var el = end.previousSibling; el && el !== start; el = end.previousSibling) {
				parent.removeChild(el);
			}

			var fragment = document.createDocumentFragment();

			var fragmentPointer: HydrationPointer<DocumentFragment> = {
				context: fragment,
				currentNode: null,
				isSVG: pointer.isSVG,
				parentEffect: getEffect(),
				stopNode: null
			};
			
			hydrate(fragmentPointer, innerTemplate);
			parent.insertBefore(fragment, end);
		} else {
			var innerPointer: HydrationPointer<P> = {
				context: parentNode,
				currentNode: pointer.currentNode,
				isSVG: pointer.isSVG,
				parentEffect: getEffect(),
				stopNode: end
			};

			parentNode.insertBefore(start, pointer.currentNode);
			hydrate(innerPointer, innerTemplate);
			pointer.currentNode = innerPointer.currentNode;
			parentNode.insertBefore(end, pointer.currentNode);
		}
	}, view.errorHandler);

	updateEffect(effect);
}
