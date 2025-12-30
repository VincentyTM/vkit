/**
 * Copies the specified text to the clipboard.
 * 
 * It must be called by a user action (for example, a click event).
 * @example
 * function CopyButton() {
 * 	const win = getWindow();
 * 
 * 	return Button("Copy!", {
 * 		onclick() {
 * 			copyText("Hello world", win);
 * 		}
 * 	});
 * }
 * @param text The text to copy.
 * @param window A window instance. Required for using the clipboard API
 * as well as inserting a temporary textarea if necessary.
 */
export function copyText(text: string, window: Window | null): void {
	if (window === null) {
		throw new TypeError("Window is not available");
	}

	var doc = window.document;
	var nav = window.navigator;

	function exec(): void {
		var container = doc.body || doc.documentElement;
		var textarea = doc.createElement("textarea");
		textarea.value = text;
		container.appendChild(textarea);
		textarea.select();
		doc.execCommand("copy");
		container.removeChild(textarea);
	}

	if (nav.clipboard) {
		nav.clipboard.writeText(text).then(null, exec);
	} else {
		exec();
	}
}
