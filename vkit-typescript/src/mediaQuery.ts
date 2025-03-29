import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

function getFalse(): boolean {
    return false;
}

export function mediaQuery(query: string): Signal<boolean> {
    var win = getWindow();
    
    if (!win || !win.matchMedia) {
        return computed(getFalse);
    }
    
    var matcher = win.matchMedia(query);
    var matches = signal(matcher.matches);
    
    function handleChange(e: MediaQueryListEvent): void {
        matches.set(e.matches);
    }
    
    if (matcher.addEventListener) {
        matcher.addEventListener("change", handleChange);
        
        onDestroy(function(): void {
            matcher.removeEventListener("change", handleChange);
        });
    } else {
        matcher.addListener(handleChange);
        
        onDestroy(function(): void {
            matcher.removeListener(handleChange);
        });
    }
    
    return matches;
}
