var map = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#039;"
};

function replacer(c) {
	return map[c];
}

export default function escapeHTML(html) {
	return String(html).replace(/[&<>"']/g, replacer);
}
