const buildDevDebugScriptElement = require("./buildDevDebugScriptElement");
const buildDevHotReloadScriptElement = require("./buildDevHotReloadScriptElement");
const buildDevLinkElements = require("./buildDevLinkElements");
const buildDevScriptElements = require("./buildDevScriptElements");
const buildTemplateIndexHtml = require("./buildTemplateIndexHtml");

module.exports = ({
	config: {
		apiPath,
		htmlDebugToken,
		htmlHotReloadToken,
		htmlScriptToken,
		htmlStyleToken,
		indexHtmlFile,
		indexPath,
		srcDir,
		srcPath
	},
	fileCache,
	html,
	libraryContainer,
	output
}) => (html || buildTemplateIndexHtml({
	config: {
		srcDir,
		htmlHotReloadToken
	},
	fileCache,
	templateFile: indexHtmlFile
}))
	.replace(htmlDebugToken, () => buildDevDebugScriptElement())
	.replace(htmlHotReloadToken, () => buildDevHotReloadScriptElement({
		apiPath,
		fileCache,
		indexPath,
		srcDir,
		srcPath
	}))
	.replace(htmlScriptToken, () => buildDevScriptElements({
		fileCache,
		libraryContainer,
		output,
		srcDir,
		srcPath
	}))
	.replace(htmlStyleToken, () => buildDevLinkElements({
		fileCache,
		srcDir,
		srcPath
	}))
;
