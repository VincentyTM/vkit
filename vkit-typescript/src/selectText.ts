/**
 * Selects a text range in an input or textarea element.
 * @param element The input/textarea element in which the text is selected.
 * @param start The start caret position of the selection, inclusive.
 * @param end The end caret position of the selection, exclusive.
 */
export function selectText(
	element: HTMLInputElement & HTMLTextAreaElement,
	start: number,
	end: number
): void {
	if (element.setSelectionRange) {
		element.focus();
		element.setSelectionRange(start, end);
	} else if ((element as any).createTextRange) {
		var range = (element as any).createTextRange();
		range.collapse(true);
		range.moveEnd("character", start);
		range.moveStart("character", end);
		range.select();
	} else {
		element.focus();
		element.selectionStart = start;
		element.selectionEnd = end;
	}
}
