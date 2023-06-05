const buildDevScriptLibraries = require("./buildDevScriptLibraries");
const minifyLibrary = require("./minifyLibrary");

module.exports = ({
	libraryContainer,
	source
}) => (
	minifyLibrary(
		buildDevScriptLibraries({libraryContainer, source})
	)
);
