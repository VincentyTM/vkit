const comparePaths = require("./comparePaths");
const isCSS = require("./isCSS");

module.exports = ({fileCache, srcDir, srcPath}) => fileCache.keys()
	.filter(isCSS)
	.sort(comparePaths)
	.map(path => `<link rel="stylesheet" href="${
		path.replace(srcDir + "/", srcPath) + "?v=" + fileCache.getVersion(path)
	}">`)
	.join("\n");
