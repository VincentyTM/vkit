module.exports = script => script
	.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
	.split("\r").join("\n")
	.split("\n\n").join("\n")
	.split("\n\n").join("\n")
	.split("\n\n").join("\n")
	.split("\t").join("")
	.split("\n").join("");
