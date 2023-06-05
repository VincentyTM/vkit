module.exports = ({libraryContainer, source}) => libraryContainer
	.getLibraries(source)
	.map(lib => lib.source)
	.join("\n");
