const {watchDirectory} = require("../server-libraries");
const addDirectoryToCache = require("./addDirectoryToCache");
const createDirectory = require("./createDirectory");
const isTextFile = require("./isTextFile");

module.exports = async (fileCache, srcDir, templateSrcDir, handleError) => {
	const updateCache = async (path, eventType) => {
		if( isTextFile(path) ){
			await fileCache.update(path, eventType);
		}
	};
	
	await createDirectory(srcDir, templateSrcDir);
	await addDirectoryToCache(srcDir, fileCache);
	return watchDirectory(srcDir, updateCache, handleError);
};
