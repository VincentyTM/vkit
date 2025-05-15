interface TextSelection {
	end: number;
	start: number;
}

/**
 * Returns the start and end position of the text selection in an input/textarea element.
 * @param element The input or textarea element.
 * @returns The start and end caret position of the selection.
 */
export function getTextSelection(element: HTMLInputElement & HTMLTextAreaElement): TextSelection {
	var selection = (element.ownerDocument as any).selection;
	
	if (selection) {
		var sel = selection.createRange();
		var length = sel.text.length;
		var end = sel.text.length;
		
		sel.moveStart("character", -element.value.length);
		
		return {
			start: end - length,
			end: end
		};
	}
	
	return {
		start: element.selectionStart || 0,
		end: element.selectionEnd || 0
	};
}
