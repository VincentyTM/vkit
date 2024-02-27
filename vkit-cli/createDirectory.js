import fs from "fs";
import {copyDirectory} from "../server-libraries/index.js";

const {promises: fsp} = fs;

const createDirectory = async (srcDir, templateSrcDir = null) => {
	if (templateSrcDir) {
		try {
			await copyDirectory(templateSrcDir, srcDir);
		} catch (ex) {
		}
	} else {
		await fsp.mkdir(srcDir, {
			recursive: true
		});
	}
};

export default createDirectory;
