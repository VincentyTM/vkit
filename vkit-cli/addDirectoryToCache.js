const {readDirectory} = require("./server-libraries");
const isTextFile = require("./isTextFile");

module.exports = async (srcDir, fileCache) => {
	await readDirectory(srcDir, (path) => {
		if( isTextFile(path) ){
			fileCache.update(path);
		}
	});
};
