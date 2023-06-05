const buildReleaseScript = require("./buildReleaseScript");
const escapeScript = require("./escapeScript");

module.exports = ({
	fileCache,
	filter,
	libraryContainer,
	output,
	srcDir
}) => {
	const code = escapeScript(
		buildReleaseScript({
			fileCache,
			filter,
			libraryContainer,
			output,
			srcDir
		})
	);
	
	return `<script>\n${code}\n</script>`;
};
