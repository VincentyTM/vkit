const scriptReplacer = (source) => "<\\" + source.substring(1);
const styleReplacer = (source) => "<\\" + source.substring(1);

export const escapeScript = (source) => source.replace(/<\/script\b/ig, scriptReplacer);

export const escapeString = (source) => (
	source
		.replace(/\\/g, "\\\\")
		.replace(/"/g, "\\\"")
		.replace(/\f/g, "\\f")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t")
		.replace(/\v/g, "\\v")
);

export const escapeStyle = (source) => source.replace(/<\/style\b/ig, styleReplacer);
