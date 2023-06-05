module.exports = style => style
	.split("\t").join("")
	.split("\r").join("")
	.split("\n").join("")
	.split("  ").join(" ");
