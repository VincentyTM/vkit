const comparePaths = require("./comparePaths");
const escapeStyle = require("./escapeStyle");
const isCSS = require("./isCSS");
const minifyCSS = require("./minifyCSS");

module.exports = ({
	fileCache,
	filter = (path) => true
}) => {
	const source = fileCache.keys()
		.filter(path => isCSS(path) && filter(path))
		.sort(comparePaths)
		.map(path => fileCache.get(path))
		.join("\n");
	
	const code = escapeStyle(minifyCSS(source));
	
	return `<style>${code}</style>`;
};
