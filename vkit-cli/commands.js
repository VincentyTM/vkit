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
	async startServer(port){
		try{
			await this.server.start(port);
			console.log("Server is running on port " + port + ". Type 'help' for help.");
		}catch(ex){
			console.error("Error while starting server:", ex);
		}
	}
	startBrowser(port){
		startBrowser("http://localhost:" + port);
	}
	async exportApplication(src){
		try{
			await new Promise(async (resolve, reject) =>
				fs.writeFile(
					src,
					src.toLowerCase().endsWith(".js")
						? this.htmlCompiler.getScriptsRaw()
						: await this.htmlCompiler.compile(null, false),
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
		await this.cache.updateDirectory(this.config.appDirectory + "/app");
	}
	async loadConfig(){
		await this.config.load();
	}
}

module.exports = Commands;
