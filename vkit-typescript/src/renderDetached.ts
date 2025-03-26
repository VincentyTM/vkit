import { append } from "./append.js";
import { bind } from "./bind.js";
import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { destroyEffect } from "./destroyEffect.js";
import { WindowService } from "./getWindow.js";
import { inject } from "./inject.js";
import { Template } from "./Template.js";
import { update } from "./update.js";
import { updateEffect } from "./updateEffect.js";

export function renderDetached<C extends Node>(
    getView: (unmount: () => void) => Template<C>,
    container: C
): () => void {
    var injector = createInjector(undefined, true);
    
    var effect = createEffect(undefined, injector, function(): void {
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
    });

    function unmount(): void {
        destroyEffect(effect);
    }
    
    updateEffect(effect);
    update();
    return unmount;
}
