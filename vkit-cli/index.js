export {default as addDirectoryToCache} from "./addDirectoryToCache.js";

export {
	buildDevDebugScriptElement,
	buildDevHotReloadScriptElement,
	buildDevIndexHtml,
	buildDevLinkElements,
	buildDevScriptElements,
	buildDevScriptLibraries,
	buildReleaseIndexHtml,
	buildReleaseIndexJS,
	buildReleaseScript,
	buildReleaseScriptElement,
	buildReleaseScriptLibraries,
	buildReleaseScriptWithoutLibraries,
	buildScriptDataFiles,
	buildTemplateIndexHtml,
	buildTemplateIndexJS,
} from "./build.js";

export {default as CLI} from "./CLI.js";
export {default as comparePaths} from "./comparePaths.js";
export {default as Config} from "./Config.js";
export {default as createDevServer} from "./createDevServer.js";
export {default as createDirectory} from "./createDirectory.js";
export {default as createFileCache} from "./createFileCache.js";
export {default as createReloader} from "./createReloader.js";

export {
	escapeScript,
	escapeString,
	escapeStyle,
} from "./escape.js";

export {default as exportApp} from "./exportApp.js";
export {default as initSrcDirectory} from "./initSrcDirectory.js";
export {default as initWwwDirectory} from "./initWwwDirectory.js";

export {
	isCSS,
	isHTML,
	isJS,
	isJSON,
	isLibJS,
	isReleaseJS,
	isTemplateJS,
	isTestJS,
	isTextFile,
	isTXT,
} from "./is.js";

export {default as LibraryContainer} from "./LibraryContainer.js";
export {default as listenToCommands} from "./listenToCommands.js";

export {
	minifyCSS,
	minifyLibrary,
} from "./minify.js";

export {default as readCommandLineArguments} from "./readCommandLineArguments.js";
