import { clientRenderView } from "./clientRenderView.js";
import { getEffect } from "./contextGuard.js";
import { hydrateView } from "./hydrateView.js";
import { serverRenderView } from "./serverRenderView.js";
import { signal } from "./signal.js";
import { Template } from "./Template.js";
import { ViewTemplate } from "./view.js";

/**
 * Creates and returns an error boundary.
 * It can be used to catch errors that occur during rendering and display a placeholder.
 * @example
 * function MyErrorBoundary() {
 * 	return errorBoundary(MyComponent, PlaceholderComponent);
 * }
 * 
 * function MyComponent() {
 * 	// Throw an error with 50% chance
 * 	if (Math.random() < 0.5) {
 * 		throw new Error("This is some error");
 * 	}
 * 	return "Successfully rendered.";
 * }
 * 
 * function PlaceholderComponent(error: unknown, retry: () => void) {
 * 	console.error("Error caught by error boundary", error);
 * 
 * 	return [
 * 		P("Some error occurred."),
 * 		Button("Retry", {
 * 			onclick: retry
 * 		})
 * 	];
 * }
 * @param getTemplate A function that returns a view.
 * @param getFallbackTemplate A function that returns a placeholder view.
 * @returns The error boundary.
 */
export function errorBoundary<P extends Element>(
	getTemplate: () => Template<P>,
	getFallbackTemplate: (error: unknown, retry: () => void) => Template<P>
): ViewTemplate<P, void> {
	var error: unknown;
	var isFailed = signal(false);
	
	function retry(): void {
		error = undefined;
		isFailed.set(false);
	}
	
	function errorHandler(ex: unknown): void {
		error = ex;
		isFailed.set(true);
	}
	
	function getOuterTemplate(): Template<P> {
		if (isFailed()) {
			return getFallbackTemplate(error, retry);
		}
		
		try {
			return getTemplate();
		} catch (ex) {
			return getFallbackTemplate(ex, retry);
		}
	}

	return {
		parentEffect: getEffect(),
		signal: null,
		clientRender: clientRenderView,
		errorHandler: errorHandler,
		getTemplate: getOuterTemplate,
		hydrate: hydrateView,
		serverRender: serverRenderView
	};
}
