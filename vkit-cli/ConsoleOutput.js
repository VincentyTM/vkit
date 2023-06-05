class ConsoleOutput {
	message = null;
	isServerRunning = false;
	port = 0;
	loadingCount = 0;
	
	showMessage(type, value){
		this.message = {type, value};
		this.render();
		this.message = null;
	}
	
	reset(){
		this.message = null;
		this.render();
	}
	
	serverStarted(port){
		this.isServerRunning = true;
		this.port = port;
		this.render();
	}
	
	serverStopped(){
		this.isServerRunning = false;
		this.port = 0;
		this.render();
	}
	
	warnInvalidJSON(path){
		this.showMessage("warn", "Warning: the content of '" + path + "' is not valid JSON");
	}
	
	configWatchError(error){
		this.showMessage("error", "Cannot watch config file: " + error);
	}
	
	httpError(error){
		this.showMessage("error", "HTTP request error: " + error);
	}
	
	devServerError(error){
		this.showMessage("error", "Development server error: " + error);
	}
	
	portInUse(port){
		this.showMessage("warn", "Port " + port + " is in use, finding another one...");
	}
	
	pkcStartLoading(){
		this.showMessage("log", "Loading private key and certificate...");
	}
	
	pkcLoaded(){
		this.showMessage("log", "Loaded private key and certificate...");
	}
	
	pkcError(error){
		this.showMessage("error", "Could not load private key or certificate: " + error);
	}
	
	srcDirError(ex){
		this.showMessage("error", "Could not initialize src directory: " + error);
	}
	
	wwwDirError(ex){
		this.showMessage("error", "Could not initialize www directory: " + error);
	}
	
	exportedFiles(files){
		if( files.length > 0 ){
			this.showMessage("log", "Exported to " + files.join(", "));
		}
	}
	
	loadingLibraries(){
		this.showMessage("log", "Loading libraries...");
	}
	
	loadedLibraries(){
		this.showMessage("log", "Loaded libraries.");
	}
	
	showHelp(){
		this.showMessage("log", [
			"+---------------+",
			"| vKit CLI help |",
			"+---------------+",
			"  build: Clear cache and rebuild application",
			"  config: Reload config file",
			"  exit: Exit",
			"  export: Export application to a standalone HTML or JS file",
			"  help: Show this help",
			"  reload: Reload browser tab(s)",
			"  start: Start application in browser"
		].join("\n"));
	}
	
	unknownCommand(cmd){
		this.showMessage("log", "Unknown command '" + cmd + "'. Try 'help'.");
	}
	
	dependencyNotFound(name, dep){
		this.showMessage("warn", "Warning: In library '" + name + "' the '" + dep + "' dependency cannot be found");
	}
	
	dependencyNotDefined(dep){
		this.showMessage("warn", "Warning: " + dep + " is not defined in any library");
	}
	
	configReloaded(){
		this.showMessage("log", "Reloaded config file.");
	}
	
	startLoading(){
		++this.loadingCount;
		this.render();
	}
	
	finishLoading(){
		--this.loadingCount;
		this.render();
	}
	
	startLoadingFileCache(){
		this.startLoading();
	}
	
	finishLoadingFileCache(){
		this.finishLoading();
	}
	
	logFileChanges(changes){
		const count = Object.keys(changes).length;
		const lines = [];
		
		if( count >= 10 ){
			lines.push("Loaded " + count + " files");
		}else{
			for(const path in changes){
				if( changes[path] === null ){
					lines.push("Unloaded " + path);
				}else{
					lines.push("Loaded " + path);
				}
			}
		}
		
		if( lines.length > 0 ){
			this.showMessage("log", lines.join("\n"));
		}
	}
	
	render(){
		console.clear();
		
		if( this.isServerRunning ){
			console.log("");
			console.log("\x1b[1m\x1b[32mServer is listening on port " + this.port + ". Type 'help' for help.\x1b[0m");
			console.log("");
		}
		
		if( this.loadingCount > 0 ){
			console.log("Loading...");
			console.log("");
		}
		
		if( this.message ){
			switch(this.message.type){
				case "log": console.log(this.message.value); break;
				case "warn": console.warn(this.message.value); break;
				case "error": console.error(this.message.value); break;
			}
			
			console.log("");
		}
	}
}

module.exports = ConsoleOutput;
