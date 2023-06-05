const comparePaths = require("./comparePaths");
const escapeString = require("./escapeString");
const isJSON = require("./isJSON");
const isTXT = require("./isTXT");

module.exports = ({
	fileCache,
	filter = (path) => true,
	output,
	srcDir
}) => {
	const keys = fileCache.keys().filter(filter);
	const txtFiles = keys.filter(isTXT).sort(comparePaths);
	const jsonFiles = keys.filter(isJSON).sort(comparePaths);
	
	const txts = txtFiles.map(
		path => (
			"\"" +
			escapeString(path.replace(srcDir + "/", "")) +
			"\":\"" +
			escapeString(fileCache.get(path)) +
			"\","
		)
	);
	
	const jsons = jsonFiles.map(path => {
		const jsonString = fileCache.get(path);
		
		try{
			JSON.parse(jsonString);
			return (
				"\"" +
				escapeString(path.replace(srcDir + "/", "")) +
				"\":" +
				jsonString +
				","
			);
		}catch(ex){
			output.warnInvalidJSON(path);
			return "";
		}
	});
	
	const all = [
		...txts,
		...jsons
	];
	
	return all.length > 0 ? "$.data={" + all.join("").slice(0, -1) + "};\n" : "";
};
