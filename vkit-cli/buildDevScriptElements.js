const buildDevScriptLibraries = require("./buildDevScriptLibraries");
const buildScriptDataFiles = require("./buildScriptDataFiles");
const comparePaths = require("./comparePaths");
const escapeScript = require("./escapeScript");
const isJS = require("./isJS");
const isReleaseJS = require("./isReleaseJS");
const isTemplateJS = require("./isTemplateJS");

module.exports = ({
	fileCache,
	libraryContainer,
	output,
	srcDir,
	srcPath
}) => {
	const sourceFiles = fileCache
		.keys()
		.filter(path => isJS(path) && !isReleaseJS(path) && !isTemplateJS(path))
		.sort(comparePaths);
	
	const source = sourceFiles
		.map(path => fileCache.get(path))
		.join("\n");
	
	const libs = buildDevScriptLibraries({
		libraryContainer,
		source
	});
	
	const scripts = sourceFiles.map(path => (
		`<script src="${
			path.replace(srcDir + "/", srcPath)
		}?v=${
			fileCache.getVersion(path)
		}"></script>`
	)).join("\n");
	
	const dataFiles = buildScriptDataFiles({
		fileCache,
		output,
		srcDir
	});
	
	const scriptContents = escapeScript(`\n"use strict";\n${libs}\n${dataFiles}`);
	
	return `<script>${scriptContents}</script>\n${scripts}`;
};
