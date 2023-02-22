const fs = require("fs");
const startBrowser = require("./start-browser.js");

class Commands {
	constructor(server, reloader, cache, config, htmlCompiler){
		this.server = server;
		this.reloader = reloader;
		this.cache = cache;
		this.config = config;
		this.htmlCompiler = htmlCompiler;
	}
	async startServer(){
		try{
			console.log("Server is running on port " + port + ". Type 'help' for help.");
			await this.server.start(this.config);
		}catch(ex){
			console.error("Error while starting server:", ex);
		}
	}
	startBrowser(port, path = "/"){
		startBrowser("http://localhost:" + port + path);
	}
	async exportApplication(src, includeLibraries){
		try{
			await new Promise(async (resolve, reject) =>
				fs.writeFile(
					src,
					src.toLowerCase().endsWith(".js")
						? this.htmlCompiler.getScriptsAsModule(
							includeLibraries,
							this.config.appDirectory + "/src/" + this.config.moduleFile,
							this.config.moduleSymbol
						)
						: await this.htmlCompiler.compile(null, false, includeLibraries),
					{ flag: "w" },
					err => err ? reject(err) : resolve()
				)
			);
			console.log("Exported to '" + src + "'.");
		}catch(ex){
			console.error("Error while exporting to '" + src + "'.");
		}
	}
	reload(data){
		this.reloader.reload(data);
	}
	async rebuild(){
		this.cache.clear();
		await this.build();
		this.reload();
	}
	async build(){
		await this.cache.updateDirectory(this.config.appDirectory + "/src");
	}
	async loadConfig(){
		await this.config.load();
	}
}

module.exports = Commands;
