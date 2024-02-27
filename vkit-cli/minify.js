export const minifyCSS = style => style
	.split("\t").join("")
	.split("\r").join("")
	.split("\n").join("")
	.split("  ").join(" ");

export const minifyLibrary = script => script
	.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
	.split("\r").join("\n")
	.split("\n\n").join("\n")
	.split("\n\n").join("\n")
	.split("\n\n").join("\n")
	.split("\t").join("")
	.split("\n").join("");
