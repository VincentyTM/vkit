export function toKebabCase(text: string): string {
    return text.replace(/[A-Z]/g, replaceUpperCase);
}

function replaceUpperCase(letter: string): string {
	return "-" + letter.toLowerCase();
}
