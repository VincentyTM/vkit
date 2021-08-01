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
		return await new Promise(async (resolve, reject) =>
			fs.writeFile(
				src,
				await this.htmlCompiler.compile(null, false),
				{ flag: "w" },
				err => {
					if( err ){
						console.error("Error while exporting file to '", src, "': ", err);
						reject(err);
					}else{
						console.log("Exported to file", src);
						resolve(src);
					}
				}
			)
		);
	}
	reload(){
		this.reloader.reload();
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
