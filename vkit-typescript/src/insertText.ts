/**
 * Inserts a text into an input or textarea element at the current caret position.
 * Replaces the selection with the new value and collapses the selection after the inserted value.
 * @param element The input/textarea element.
 * @param value The new text value or a function that transforms the old value to the new value.
 */
export function insertText(
	element: HTMLInputElement | HTMLTextAreaElement,
	value: string | ((oldValue: string) => string)
): void {
	var doc = element.ownerDocument;
	
	if ((doc as any).selection) {
		element.focus();
		
		var sel = (doc as any).selection.createRange();
		sel.text = typeof value === "function" ? value(sel.text) : value;
		sel.moveStart("character", -element.value.length);
		
		var pos = sel.text.length;
		var range = (element as any).createTextRange();
		range.collapse(true);
		range.moveEnd("character", pos);
		range.moveStart("character", pos);
		range.select();
	} else if ("selectionStart" in element) {
		var s = element.selectionStart || 0;
		var e = element.selectionEnd || 0;
		
		if (typeof value === "function") {
			value = value(element.value.substring(s, e));
		}
		
		if (!doc.execCommand || !doc.execCommand("insertText", false, value)) {
			element.value = element.value.substring(0, s) + value + element.value.substring(e);
		}
		
		var c = s + value.length;
		
		element.focus();
		element.setSelectionRange(c, c);
	}
}
