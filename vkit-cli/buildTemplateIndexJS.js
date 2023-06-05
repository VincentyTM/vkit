module.exports = ({
	config: {
		srcDir,
		jsAppToken
	},
	fileCache,
	templateFile
}) => fileCache.get(srcDir + "/" + templateFile) || jsAppToken;
