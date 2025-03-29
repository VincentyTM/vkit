import { RenderConfig } from "./RenderConfigService.js";
import { renderToStream } from "./renderToStream.js";
import { Template } from "./Template.js";

export function renderToString(
	getTemplate: () => Template<ParentNode>,
	renderConfig: RenderConfig
): string {
	var values: string[] = [];
	var stream = {
		write: function(value: string): void {
			values.push(value);
		}
	};

	renderToStream(stream, getTemplate, renderConfig);
	return values.join("");
}
