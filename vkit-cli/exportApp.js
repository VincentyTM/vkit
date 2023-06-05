const fs = require("fs");
const buildReleaseIndexHTML = require("./buildReleaseIndexHTML");
const buildReleaseIndexJS = require("./buildReleaseIndexJS");
const isHTML = require("./isHTML");
const isJS = require("./isJS");
const {promises: fsp} = fs;

const alwaysTrue = (path) => true;

module.exports = async ({
	config: {
		bundles,
		htmlDebugToken,
		htmlHotReloadToken,
		htmlScriptToken,
		htmlStyleToken,
		jsAppToken,
		srcDir,
		wwwDir
	},
	fileCache,
	libraryContainer,
	output
}) => {
	return (
		await Promise.all(
			bundles.map(async ({
				includeLibraries = true,
				srcSubdir = "",
				targetFile,
				templateFile
			}) => {
				const prefix = srcDir + "/" + srcSubdir + "/";
				const filter = srcSubdir
					? (path) => path.startsWith(prefix)
					: alwaysTrue;
				
				if( isHTML(targetFile) ){
					await fsp.writeFile(targetFile, buildReleaseIndexHTML({
						config: {
							htmlDebugToken,
							htmlHotReloadToken,
							htmlScriptToken,
							htmlStyleToken,
							srcDir
						},
						fileCache,
						filter,
						libraryContainer,
						templateFile
					}));
					return targetFile;
				}
				
				if( isJS(targetFile) ){
					await fsp.writeFile(targetFile, buildReleaseIndexJS({
						config: {
							jsAppToken,
							srcDir
						},
						fileCache,
						filter,
						includeLibraries,
						libraryContainer,
						output,
						templateFile
					}));
					return targetFile;
				}
				
				return null;
			})
		)
	).filter(Boolean);
};
