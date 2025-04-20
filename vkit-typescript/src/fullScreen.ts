import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { updateSignalValue, WritableSignal } from "./signal.js";

interface FullScreenSignal extends WritableSignal<Element | null> {
	readonly document: Document | null;
}

declare global {
	interface Document {
		mozFullScreenElement: Element | null;
		msFullscreenElement: Element | null;
		webkitCurrentFullScreenElement: Element | null;
		webkitFullscreenElement: Element | null;
		cancelFullScreen(): void;
		mozCancelFullScreen(): void;
		msExitFullscreen(): void;
		webkitCancelFullScreen(): void;
		webkitExitFullscreen(): void;
	}

	interface Element {
		mozRequestFullScreen(): void;
		msRequestFullscreen(): void;
		webkitEnterFullscreen(): void;
		webkitRequestFullscreen(): void;
	}
}

export function fullScreen(): FullScreenSignal {
	var win = getWindow();
	var doc = win ? win.document : null;
	var element: Signal<Element | null> = doc !== null ? fullScreenElement(doc) : computed(getNull);
	var fullScreenSignal = element as FullScreenSignal;

	(fullScreenSignal.document as Document | null) = doc;
	fullScreenSignal.set = setFullScreenElement;
	fullScreenSignal.update = updateSignalValue;
	return fullScreenSignal;
}

function getNull(): null {
	return null;
}

function getFullScreenElement(doc: Document): Element | null {
	return (
		doc.fullscreenElement ||
		doc.mozFullScreenElement ||
		doc.webkitFullscreenElement ||
		doc.webkitCurrentFullScreenElement ||
		doc.msFullscreenElement ||
		null
	);
}

function fullScreenElement(doc: Document): Signal<Element | null> {
	var result = computed(getFullScreenElement, [doc]);

	onDestroy(
		onEvent(
			doc,
			"onfullscreenchange" in doc ? "fullscreenchange" : "webkitfullscreenchange",
			function(): void {
				result.invalidate();
			}
		)
	);

	return result;
}

function setFullScreenElement(this: FullScreenSignal, element: Element | null): void {
	var doc = this.document;

	if (doc === null || this.get() === element) {
		return;
	}

	if (element === null) {
		doc.exitFullscreen ? doc.exitFullscreen() :
		doc.cancelFullScreen ? doc.cancelFullScreen() :
		doc.mozCancelFullScreen ? doc.mozCancelFullScreen() :
		doc.webkitCancelFullScreen ? doc.webkitCancelFullScreen() :
		doc.webkitExitFullscreen ? doc.webkitExitFullscreen() :
		doc.msExitFullscreen ? doc.msExitFullscreen() :
		null;
	} else {
		element.requestFullscreen ? element.requestFullscreen() :
		element.mozRequestFullScreen ? element.mozRequestFullScreen() :
		element.webkitRequestFullscreen ? element.webkitRequestFullscreen() :
		element.webkitEnterFullscreen ? element.webkitEnterFullscreen() :
		element.msRequestFullscreen ? element.msRequestFullscreen() :
		null;
	}
}
