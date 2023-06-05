const buildReleaseScriptLibraries = require("./buildReleaseScriptLibraries");
const buildReleaseScriptWithoutLibraries = require("./buildReleaseScriptWithoutLibraries");

module.exports = ({
	fileCache,
	filter,
	libraryContainer,
	output,
	srcDir
}) => {
	const source = buildReleaseScriptWithoutLibraries({
		fileCache,
		filter,
		output,
		srcDir
	});
	const libs = buildReleaseScriptLibraries({
		libraryContainer,
		source
	});
	return `"use strict";\n${libs}\n${source}`;
};
