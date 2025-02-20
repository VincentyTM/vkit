import { append } from "./append.js";
import { bind } from "./bind.js";
import { createComponent } from "./createComponent.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { emitUnmount } from "./emitUnmount.js";
import { getValueFromClass } from "./root.js";
import { inject } from "./inject.js";
import { update } from "./update.js";
import type { View } from "./view.js";
import { WindowService } from "./getWindow.js";

export function renderDetached<C extends Node>(
    getView: (unmount: () => void) => View<C>,
    container: C
): () => void {
    var injector = createInjector(null, function(token) {
        var provider = createProvider(getValueFromClass, token, component);
        injector.container.set(token, provider);
        return provider.getInstance();
    });
    
    var component = createComponent(function(): void {
        var win: (Window & typeof globalThis) | null = null;
        
        if (container) {
            var doc = container.ownerDocument;

            if (doc) {
                win = doc.defaultView || (doc as any).parentWindow;
            }
        }
        
        if (win) {
            inject(WindowService).window = win;
        }
        
        var view = getView(unmount);
        
        if (container) {
            append(container, view, container, bind);
        }
    }, null, injector);

    function unmount(): void {
        emitUnmount(component);
    }
    
    component.render();
    update();
    return unmount;
}
