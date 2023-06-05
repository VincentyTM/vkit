module.exports = string => string
	.replace(/\\/g, "\\\\")
	.replace(/"/g, "\\\"")
	.replace(/\f/g, "\\f")
	.replace(/\n/g, "\\n")
	.replace(/\r/g, "\\r")
	.replace(/\t/g, "\\t")
	.replace(/\v/g, "\\v");
