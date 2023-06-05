const buildReleaseScript = require("./buildReleaseScript");
const buildReleaseScriptWithoutLibraries = require("./buildReleaseScriptWithoutLibraries");
const buildTemplateIndexJS = require("./buildTemplateIndexJS");

module.exports = ({
	config: {
		jsAppToken,
		srcDir
	},
	fileCache,
	filter,
	includeLibraries,
	js,
	libraryContainer,
	output,
	templateFile
}) => (js || buildTemplateIndexJS({
	config: {
		srcDir,
		jsAppToken
	},
	fileCache,
	templateFile
})).replace(jsAppToken, () => includeLibraries
	? buildReleaseScript({
		fileCache,
		filter,
		libraryContainer,
		output,
		srcDir
	})
	: buildReleaseScriptWithoutLibraries({
		fileCache,
		filter,
		output
	})
);
