const buildReleaseScriptElement = require("./buildReleaseScriptElement");
const buildReleaseStyleElement = require("./buildReleaseStyleElement");
const buildTemplateIndexHtml = require("./buildTemplateIndexHtml");

module.exports = ({
	config: {
		htmlDebugToken,
		htmlHotReloadToken,
		htmlScriptToken,
		htmlStyleToken,
		srcDir
	},
	fileCache,
	filter,
	html,
	libraryContainer,
	output,
	templateFile
}) => (html || buildTemplateIndexHtml({
	config: {
		srcDir,
		htmlHotReloadToken
	},
	fileCache,
	templateFile
}))
	.replace(htmlDebugToken, "")
	.replace(htmlHotReloadToken, "")
	.replace(htmlScriptToken, () => buildReleaseScriptElement({
		fileCache,
		filter,
		libraryContainer,
		output,
		srcDir
	}))
	.replace(htmlStyleToken, () => buildReleaseStyleElement({
		fileCache,
		filter
	}))
;
