import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { inject } from "./inject.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { RenderConfigService } from "./RenderConfigService.js";

interface NavigatorExtension extends Navigator {
	readonly browserLanguage: string;
	readonly systemLanguage: string;
	readonly userLanguage: string;
}

function getEmptyArray(): [] {
	return [];
}

function getPreferredLanguages(nav: NavigatorExtension): readonly string[] {
	return nav.languages || [
		nav.language ||
		nav.browserLanguage ||
		nav.systemLanguage ||
		nav.userLanguage
	];
}

export function preferredLanguages(): Signal<readonly string[]> {
	var win = getWindow();

	if (!win) {
		var request = inject(RenderConfigService).request;
	
		if (request === undefined) {
			return computed(getEmptyArray);
		}
		
		var header = request.headers["accept-language"];
		var langs = typeof header === "string" ? header.replace(/\s+/g, "").split(",") : [];
		
		for (var i = langs.length; i--;) {
			var l = langs[i];
			var p = l.indexOf(";");
			
			if (p !== -1) {
				langs[i] = l.substring(0, p);
			}
		}
		
		return computed(function(): readonly string[] {
			return langs;
		});
	}

	var nav = win.navigator as NavigatorExtension;
	
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
