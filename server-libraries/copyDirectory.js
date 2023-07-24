const {promises: fsp} = require("fs");
const path = require("path");

async function copyDirectory(src, dest){
	await fsp.mkdir(dest, {recursive: false});
	const entries = await fsp.readdir(src, {withFileTypes: true});
	await Promise.all(
		entries.map(entry => (
			(entry.isDirectory() ? copyDirectory : fsp.copyFile)(
				path.join(src, entry.name),
				path.join(dest, entry.name)
			)
		))
	);
}

module.exports = copyDirectory;
