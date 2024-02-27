import fs from "fs";

import {
	buildReleaseIndexHtml,
	buildReleaseIndexJS,
} from "./build.js";

import {
	isHTML,
	isJS,
} from "./is.js";

const {promises: fsp} = fs;

const alwaysTrue = (path) => true;

const exportApp = async ({
	config: {
		bundles,
		htmlDebugToken,
		htmlHotReloadToken,
		htmlScriptToken,
		htmlStyleToken,
		jsAppToken,
		jsLibToken,
		srcDir,
		wwwDir,
	},
	fileCache,
	libraryContainer,
	output,
}) => (
	(
		await Promise.all(
			bundles.map(async ({
				includeLibraries = true,
				srcSubdir = "",
				targetFile,
				templateFile,
			}) => {
				const prefix = srcDir + "/" + srcSubdir + "/";
				const filter = srcSubdir
					? (path) => path.startsWith(prefix)
					: alwaysTrue;
				
				if (isHTML(targetFile)) {
					await fsp.writeFile(targetFile, buildReleaseIndexHTML({
						config: {
							htmlDebugToken,
							htmlHotReloadToken,
							htmlScriptToken,
							htmlStyleToken,
							srcDir,
						},
						fileCache,
						filter,
						libraryContainer,
						templateFile,
					}));
					
					return targetFile;
				}
				
				if (isJS(targetFile)) {
					await fsp.writeFile(targetFile, buildReleaseIndexJS({
						config: {
							jsAppToken,
							jsLibToken,
							srcDir,
						},
						fileCache,
						filter,
						includeLibraries,
						libraryContainer,
						output,
						templateFile,
					}));
					
					return targetFile;
				}
				
				return null;
			})
		)
	).filter(Boolean)
);

export default exportApp;
