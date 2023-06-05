const createLibraryContainer = require("./createLibraryContainer");

class LibraryManager {
	constructor(output){
		this.output = output;
		this.libraryContainer = createLibraryContainer(output);
	}
	
	async loadLibraries(){
		this.output.loadingLibraries();
		await this.libraryContainer.addDirectory(__dirname + "/../vkit");
		await this.libraryContainer.load();
		this.output.loadedLibraries();
	}
}

module.exports = LibraryManager;
