import { append } from "./append.js";
import { bind } from "./bind.js";
import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { emitUnmount } from "./emitUnmount.js";
import { getValueFromClass } from "./root.js";
import { inject } from "./inject.js";
import { update } from "./update.js";
import { Template } from "./Template.js";
import { WindowService } from "./getWindow.js";

export function renderDetached<C extends Node>(
    getView: (unmount: () => void) => Template<C>,
    container: C
): () => void {
    var injector = createInjector(undefined, function(token) {
        var provider = createProvider(getValueFromClass, token, effect);
        injector.container.set(token, provider);
        return provider.getInstance();
    });
    
    var effect = createEffect(function(): void {
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
    }, undefined, injector);

    function unmount(): void {
        emitUnmount(effect);
    }
    
    effect.render();
    update();
    return unmount;
}
