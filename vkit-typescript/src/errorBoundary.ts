import { getComponent } from "./contextGuard.js";
import observable from "./observable.js";
import onUnmount from "./onUnmount.js";
import signal from "./signal.js";
import update from "./update.js";
import view, { type View } from "./view.js";

export function errorBoundary<T, U>(
    getView: () => View<T>,
    getFallbackView: (error: unknown, retry: () => void) => View<U>
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
	
	return failed.view(function(hasFailed: boolean): View<T> | View<U> {
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
        
        onUnmount(function(): void {
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
