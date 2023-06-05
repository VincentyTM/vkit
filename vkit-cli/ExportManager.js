const exportApp = require("./exportApp");

class ExportManager {
	constructor({
		config,
		fileCache,
		libraryContainer,
		output
	}){
		this.config = config;
		this.fileCache = fileCache;
		this.libraryContainer = libraryContainer;
		this.output = output;
	}
	
	async exportApp(){
		const {config, fileCache, libraryContainer, output} = this;
		
		this.output.exportedFiles(
			await exportApp({
				config,
				fileCache,
				libraryContainer,
				output
			})
		);
	}
}

module.exports = ExportManager;
