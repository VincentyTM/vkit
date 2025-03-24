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

export function escapeHTML(html: string): string {
	return html.replace(/[&<>"']/g, replacer);
}
