import { computed } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { Signal } from "./signal.js";

function getEmptyArray(): [] {
    return [];
}

function getPreferredLanguages(nav: Navigator): readonly string[] {
    return nav.languages || [
        nav.language ||
        (nav as any).browserLanguage ||
        (nav as any).systemLanguage ||
        (nav as any).userLanguage
    ];
}

export function preferredLanguages(): Signal<readonly string[]> {
    var win = getWindow();

    if (!win) {
        return computed(getEmptyArray);
    }

    var nav = win.navigator;
    
    var clientLangs = computed(function(): readonly string[] {
        return getPreferredLanguages(nav);
    });
    
    onDestroy(
        onEvent(win, "languagechange", function(): void {
            clientLangs.invalidate();
        })
    );
    
    return clientLangs;
}
