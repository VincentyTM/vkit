var map = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#039;"
} as const;

function replacer(c: string): string {
	return map[c as keyof typeof map];
}

/**
 * Escapes special HTML characters (&, <, >, ", ').
 * Replaces occurrences of these characters in the input string
 * with their corresponding HTML entity codes, ensuring the text is safe for HTML display.
 * 
 * @example
 * myElement.innerHTML = escapeHTML('<p>Hello world</p>');
 * // Output: &lt;p&gt;Hello world&lt;/p&gt;
 * 
 * @param html A string containing HTML text to be escaped.
 * @returns A string that is safe for insertion into HTML contexts.
 */
export function escapeHTML(html: string): string {
	return html.replace(/[&<>"']/g, replacer);
}
