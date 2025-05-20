import { asyncEffect, AsyncResult } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";

export function font(
	name: string,
	url: string | Signal<string> | (() => string)
): Signal<AsyncResult<FontFace>> {
	var win = getWindow();
	
	return asyncEffect(function(): Promise<FontFace> {
		if (win === null) {
			throw new TypeError("Window is not available");
		}

		var doc = win.document;

		if (!(doc.fonts && typeof FontFace === "function")) {
			throw new TypeError("FontFace API is not supported");
		}

		var currentURL = typeof url === "function" || isSignal(url) ? url() : url;
		var fontFace = new FontFace(name, "url(" + currentURL + ")");

		onDestroy(function() {
			doc.fonts["delete"](fontFace);
		});

		doc.fonts.add(fontFace);

		return doc.fonts.load("1em " + name).then(function(array) {
			for (var i = array.length; i--;) {
				if (array[i] === fontFace) {
					return fontFace;
				}
			}

			throw new Error("Font face '" + name + "' not found");
		});
	});
}
