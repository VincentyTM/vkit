import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { createServerElement } from "./createServerElement.js";
import { destroyEffect } from "./destroyEffect.js";
import { inject } from "./inject.js";
import { objectAssign } from "./objectAssign.js";
import { RenderConfig, RenderConfigService } from "./RenderConfigService.js";
import { serverRender } from "./serverRender.js";
import { StreamWriter } from "./StreamWriter.js";
import { Template } from "./Template.js";
import { update } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { writeServerNode } from "./writeServerNode.js";

export function renderToStream(
	stream: StreamWriter,
	getTemplate: () => Template<ParentNode>,
	renderConfig: RenderConfig
): void {
	var injector = createInjector(undefined, true);

	var effect = createEffect(undefined, injector, function() {
		var root = createServerElement("document");
		var children = root.children;

		var renderConfigService = inject(RenderConfigService);
		objectAssign(renderConfigService, renderConfig);
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
