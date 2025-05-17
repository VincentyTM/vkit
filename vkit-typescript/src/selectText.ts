/**
 * Selects the text content of the specified input or textarea element.
 * @param element The input/textarea element in which the whole text is selected.
 */
export function selectText(element: HTMLInputElement & HTMLTextAreaElement): void {
	var doc = element.ownerDocument;

	if (element.select) {
		element.select();
		return;
	}
	
	if ((doc as any).selection) {
		var textRange = (doc.body as any).createTextRange();
		textRange.moveToElementText(element);
		textRange.select();
		return;
	}

	var win: (Window & typeof globalThis) | null = doc && doc.defaultView || (doc as any).parentWindow || null;
	
	if (win && win.getSelection) {
		var range = doc.createRange();
		range.selectNode(element);

		var selection = win.getSelection();

		if (selection !== null) {
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}
}
