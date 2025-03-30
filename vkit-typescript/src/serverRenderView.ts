import { ServerElement } from "./createServerElement.js";
import { ViewTemplate } from "./view.js";
import { serverRender } from "./serverRender.js";

export function serverRenderView(container: ServerElement, view: ViewTemplate<unknown, unknown>): void {	
	serverRender(container, view.getTemplate(view.signal ? view.signal.get() : null));
}
