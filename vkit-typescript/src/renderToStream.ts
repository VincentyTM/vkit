import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { createServerElement } from "./createServerElement.js";
import { destroyEffect } from "./destroyEffect.js";
import { inject } from "./inject.js";
import { RenderConfigService, ServerRequest, ServerResponse } from "./RenderConfigService.js";
import { serverRender } from "./serverRender.js";
import { StreamWriter } from "./StreamWriter.js";
import { Template } from "./Template.js";
import { update } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { writeServerNode } from "./writeServerNode.js";

export interface RenderOptions {
	doRunEffects?: boolean;
	request: ServerRequest | undefined;
	response: ServerResponse | undefined;
}

export function renderToStream(
	stream: StreamWriter,
	getTemplate: () => Template<ParentNode>,
	renderOptions?: RenderOptions
): void {
	var injector = createInjector(undefined, true);

	var effect = createEffect(undefined, injector, function() {
		var root = createServerElement("document");
		var children = root.children;

		var renderConfigService = inject(RenderConfigService);

		renderConfigService.doRunEffects = Boolean(renderOptions && renderOptions.doRunEffects);
		renderConfigService.request = renderOptions && renderOptions.request;
		renderConfigService.response = renderOptions && renderOptions.response;

		serverRender(root, getTemplate());

		if (children) {
			var n = children.length;

			for (var i = 0; i < n; ++i) {
				writeServerNode(stream, children[i]);
			}
		}
	});

	updateEffect(effect);
	update();
	destroyEffect(effect);
}
