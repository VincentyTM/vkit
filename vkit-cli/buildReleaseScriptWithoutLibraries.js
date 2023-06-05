const buildScriptDataFiles = require("./buildScriptDataFiles");
const comparePaths = require("./comparePaths");
const isJS = require("./isJS");
const isTemplateJS = require("./isTemplateJS");
const isTestJS = require("./isTestJS");

module.exports = ({
	fileCache,
	filter = (path) => true,
	output,
	srcDir
}) => (
	buildScriptDataFiles({
		fileCache,
		filter,
		output,
		srcDir
	}) +
	fileCache
		.keys()
		.filter(path => isJS(path) && !isTestJS(path) && !isTemplateJS(path) && filter(path))
		.sort(comparePaths)
		.map(path => fileCache.get(path))
		.join("\n")
);
