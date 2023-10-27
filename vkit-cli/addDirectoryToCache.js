const {readDirectory} = require("../server-libraries");
const isTextFile = require("./isTextFile");

module.exports = async (srcDir, fileCache) => {
	await readDirectory(srcDir, async (path) => {
		if( isTextFile(path) ){
			await fileCache.update(path);
		}
	});
};
