import path from "path";
import url from "url";
import LibraryContainer from "./LibraryContainer.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class LibraryManager {
	constructor(output) {
		this.output = output;
		this.libraryContainer = new LibraryContainer(output);
	}
	
	async loadLibraries() {
		this.output.loadingLibraries();
		await this.libraryContainer.addDirectory(__dirname + "/../vkit");
		await this.libraryContainer.load();
		this.output.loadedLibraries();
	}
}
