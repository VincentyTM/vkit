import { ServerElement } from "./createServerElement.js";
import { inject } from "./inject.js";
import { StyleService } from "./style.js";
import { Template } from "./Template.js";

/**
 * Creates a placeholder for styles intended for server-side rendering.
 * This function should be used within a `<style>` element when generating server-rendered documents.
 * Attempting to render this placeholder on the client side will throw an error.
 * 
 * @returns A CSS placeholder template that will be replaced with the actual CSS once rendering completes.
 * 
 * @example
 * function ServerDocument() {
 * 	return Html(
 * 		Head(
 * 			Style(styleOutlet())
 * 		),
 * 		Body(
 * 			H1("Hello world", TitleStyle)
 * 		)
 * 	);
 * }
 * 
 * const TitleStyle = style({
 * 	color: "red"
 * });
 */
export function styleOutlet(): Template<HTMLStyleElement> {
	return {
		hydrate: hydrateStyleOutlet,
		serverRender: serverRenderStyleOutlet
	};
}

function hydrateStyleOutlet(): void {
	throw new Error("A style outlet cannot be rendered on the client side");
}

function serverRenderStyleOutlet(serverElement: ServerElement): void {
	var styleService = inject(StyleService);

	if (serverElement.tagNameLower !== "style" || serverElement.children === null) {
		throw new TypeError("CSS must be rendered within a <style> element");
	}

	if (styleService.updateCSS !== undefined) {
		throw new Error("A style outlet is already defined and cannot be redefined");
	}

	var children = serverElement.children;

	styleService.updateCSS = function() {
		children[0] = getCombinedCSS();
	};

	children[0] = getCombinedCSS();
}

function getCombinedCSS(): string {
	var styles = inject(StyleService).styles;
	var stylesArray: string[] = [];

	for (var selector in styles) {
		var style = styles[selector];

		if (style !== undefined) {
			stylesArray.push(style);
		}
	}

	return stylesArray.join("\n");
}
