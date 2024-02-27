import {watchDirectory} from "../server-libraries/index.js";
import addDirectoryToCache from "./addDirectoryToCache.js";
import createDirectory from "./createDirectory.js";
import {isTextFile} from "./is.js";

export default async function initSrcDirectory(fileCache, srcDir, templateSrcDir, handleError) {
	const updateCache = async (path, eventType) => {
		if (isTextFile(path)) {
			await fileCache.update(path, eventType);
		}
	};
	
	await createDirectory(srcDir, templateSrcDir);
	await addDirectoryToCache(srcDir, fileCache);
	return watchDirectory(srcDir, updateCache, handleError);
};
