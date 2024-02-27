import {readDirectory} from "../server-libraries/index.js";
import {isTextFile} from "./is.js";

export default async function addDirectoryToCache(srcDir, fileCache) {
	await readDirectory(srcDir, async (path) => {
		if (isTextFile(path)) {
			await fileCache.update(path);
		}
	});
};
