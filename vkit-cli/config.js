const fs = require("fs");

class Config {
	constructor(appDirectory, src, onLoad){
		this.appDirectory = appDirectory;
		this.src = src;
		this.onLoad = onLoad;
		this.port = 3000;
		this.exportFile = "export.html";
		this.autoExport = false;
		this.debugPath = "_dev_app";
		this.environment = "dev";
	}
	isRelease(){
		return this.environment === "release";
	}
	async load(){
		try{
			let needsRestart = false;
			const src = this.src;
			const json = JSON.parse(await new Promise((resolve, reject) => fs.readFile(
				src,
				"utf8",
				(err, data) => err ? reject(err) : resolve(data)
			)));
			const port = json.port ? Math.min(65535, Math.max(0, json.port|0)) : 3000;
			if( this.port !== port ){
				this.port = port;
				needsRestart = true;
			}
			this.exportFile = String(json.exportFile || "index.html");
			this.autoExport = !!json.autoExport;
			this.debugPath = String(json.debugPath || "");
			this.environment = String(json.environment).toLowerCase()==="dev" ? "dev" : "release";
			this.onLoad(needsRestart);
		}catch(ex){
			switch(ex.code){
				case "EISDIR":
					break;
				case "ENOENT":
					console.log("Config file was deleted, creating one at", this.src);
					await this.save();
					break;
				default:
					console.error("Couldn't load config file because", ex);
			}
		}
	}
	async save(){
		try{
			await new Promise((resolve, reject) =>
				fs.writeFile(this.src, JSON.stringify({
					port: this.port,
					lang: this.lang,
					themeColor: this.themeColor,
					title: this.title,
					exportFile: this.exportFile,
					autoExport: this.autoExport,
					debugPath: this.debugPath,
					environment: this.environment
				}, null, 4), err => err ? reject(err) : resolve())
			);
		}catch(ex){
			console.error("Couldn't save config file because", ex);
		}
	}
	watch(){
		try{
			const watch = fs.watch(this.src, this.load.bind(this));
			watch.on("error", err => {
				console.error("Error:", err);
			});
			return watch;
		}catch(ex){
		}
	}
}

module.exports = Config;
