import fs from "fs";
import {copyDirectory} from "../server-libraries/index.js";

const {promises: fsp} = fs;

export default async function initWwwDirectory(wwwDir, templateWwwDir, handleError) {
	if (templateWwwDir) {
		try {
			await copyDirectory(templateWwwDir, wwwDir);
		} catch (ex) {
		}
	} else {
		await fsp.mkdir(wwwDir, {
			recursive: true
		});
	}
};
