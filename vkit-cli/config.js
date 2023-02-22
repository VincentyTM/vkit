const fs = require("fs");

class Config {
	constructor(appDirectory, src, onLoad){
		this.appDirectory = appDirectory;
		this.src = src;
		this.onLoad = onLoad;
		this.port = 3000;
		this.secure = false;
		this.privateKey = "";
		this.certificate = "";
		this.staticRoot = "www";
		this.exportFile = "www/index.html";
		this.autoExport = false;
		this.includeLibraries = true;
		this.appPath = "/";
		this.debugPath = "/_dev_src/";
		this.environment = "dev";
		this.moduleFile = "module.js";
		this.moduleSymbol = "/*{script}*/";
		this.loaded = false;
	}
	isRelease(){
		return this.environment === "release";
	}
	async load(attempt = 3){
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
				if( this.loaded ){
					needsRestart = true;
				}
			}
			const secure = Boolean(json.secure);
			if( this.secure !== secure ){
				this.secure = secure;
				if( this.loaded ){
					needsRestart = true;
				}
			}
			const privateKey = String(json.privateKey || "");
			if( this.privateKey !== privateKey ){
				this.privateKey = privateKey;
				if( this.loaded ){
					needsRestart = true;
				}
			}
			const certificate = String(json.certificate || "");
			if( this.certificate !== certificate ){
				this.certificate = certificate;
				if( this.loaded ){
					needsRestart = true;
				}
			}
			this.staticRoot = String(json.staticRoot || "www");
			this.exportFile = String(json.exportFile || "index.html");
			this.autoExport = Boolean(json.autoExport);
			this.includeLibraries = Boolean(json.includeLibraries);
			this.moduleFile = String(json.moduleFile || "module.js");
			this.moduleSymbol = String(json.moduleSymbol || "/*{script}*/");
			let appPath = String(json.appPath || this.appPath);
			if(!appPath.startsWith("/")){
				appPath = "/" + appPath;
			}
			if( this.appPath !== appPath ){
				this.appPath = appPath;
				if( this.loaded ){
					needsRestart = true;
				}
			}
			let debugPath = String(json.debugPath || this.debugPath);
			if(!debugPath.startsWith("/")){
				debugPath = "/" + debugPath;
			}
			if(!debugPath.endsWith("/")){
				debugPath += "/";
			}
			this.debugPath = debugPath;
			this.environment = String(json.environment).toLowerCase() === "dev" ? "dev" : "release";
			this.loaded = true;
			this.onLoad(needsRestart);
		}catch(ex){
			switch(ex.code){
				case "EISDIR":
					break;
				case "ENOENT":
					console.log("Creating config file at '" + this.src + "'...");
					await this.save();
					break;
				default:
					if( attempt > 0 ){
						await new Promise((resolve, reject) =>
							setTimeout(() => this.load(attempt - 1).then(resolve, reject), 100)
						);
					}else{
						console.error("Error while loading config file.");
					}
			}
		}
	}
	async save(){
		try{
			await new Promise((resolve, reject) =>
				fs.writeFile(this.src, JSON.stringify({
					port: this.port,
					secure: this.secure,
					privateKey: this.privateKey,
					certificate: this.certificate,
					staticRoot: this.staticRoot,
					exportFile: this.exportFile,
					autoExport: this.autoExport,
					includeLibraries: this.includeLibraries,
					appPath: this.appPath,
					debugPath: this.debugPath,
					environment: this.environment,
					moduleFile: this.moduleFile,
					moduleSymbol: this.moduleSymbol
				}, null, 4), err => err ? reject(err) : resolve())
			);
		}catch(ex){
			console.error("Error while saving config file.");
		}
	}
	watch(){
		try{
			const watch = fs.watch(this.src, () => this.load());
			watch.on("error", err => {
				console.error("Error:", err);
			});
			return watch;
		}catch(ex){
		}
	}
}

module.exports = Config;
