import { getComponent } from "./contextGuard.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";
import { Template } from "./Template.js";
import { update } from "./update.js";

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
 * @param getView A function that returns a view.
 * @param getFallbackView A function that returns a placeholder view.
 * @returns The error boundary.
 */
export function errorBoundary<T, U>(
	getView: () => Template<T>,
	getFallbackView: (error: unknown, retry: () => void) => Template<U>
) {
	var error: unknown;
	var failed = signal(false);
	
	function retry(): void {
		failed.set(false);
		update();
	}

	function errorHandler(ex: unknown): void {
		error = ex;
		failed.set(true);
		update();
	}
	
	return failed.view(function(hasFailed: boolean): Template<T> | Template<U> {
		if (hasFailed) {
			return getFallbackView(error, retry);
		}
		
		var component = getComponent();
		var errorHandlers = component.errorHandlers;
		
		if (errorHandlers) {
			errorHandlers.push(errorHandler);
		} else {
			component.errorHandlers = [errorHandler];
		}
		
		onDestroy(function(): void {
			var errorHandlers = component.errorHandlers;

			if (!errorHandlers) {
				return;
			}

			var n = errorHandlers.length;

			for (var i = n - 1; i >= 0; --i) {
				if (errorHandlers[i] === errorHandler) {
					if (n === 1) {
						component.errorHandlers = null;
					} else {
						errorHandlers.splice(i, 1);
					}
					break;
				}
			}
		});
		
		try {
			return getView();
		} catch (ex) {
			error = ex;
			failed.set(true);
		}
	});
}
