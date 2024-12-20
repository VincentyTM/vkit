import signal from "./signal.js";

export default function objectURL(file) {
	if (file === null || file === undefined) {
		return null;
	}
	
	if (typeof file === "string") {
		return file;
	}
	
	if (typeof file === "function") {
		return signal("");
	}
}
