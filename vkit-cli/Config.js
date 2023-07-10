const fs = require("fs");
const {promises: fsp} = fs;

class Config {
	apiPath = "/api/";
	autoExport = false;
	bundles = [
		{
			includeLibraries: true,
			srcSubdir: "",
			targetFile: "www/index.html",
			templateFile: "index.html"
		}
	];
	certificateFile = "";
	htmlDebugToken = "<!--DEBUG-->";
	htmlHotReloadToken = "<!--HOT-RELOAD-->";
	htmlScriptToken = "<!--SCRIPT-->";
	htmlStyleToken = "<!--STYLE-->";
	https = false;
	indexHtmlFile = "index.html";
	indexPath = "/";
	jsAppToken = "/*{APP}*/";
	port = 3000;
	privateKeyFile = "";
	srcDir = "./src";
	srcPath = "/_dev_src/";
	startBrowser = true;
	wwwDir = "./www";
	wwwPath = "/";
	
	set(key, value){
		if( value === null || value === undefined ){
			return false;
		}
		
		if( key === "bundles" ){
			if(!Array.isArray(value)){
				return false;
			}
			
			this.bundles = value.map((bundle) => ({
				includeLibraries: Boolean(bundle.includeLibraries),
				srcSubdir: String(bundle.srcSubdir || ""),
				targetFile: String(bundle.targetFile || ""),
				templateFile: String(bundle.templateFile || "")
			}));
			
			return true;
		}
		
		const oldValue = this[key];
		
		switch(typeof oldValue){
			case "string":
				value = String(value || "");
				break;
			
			case "number":
				value = value | 0;
				break;
			
			case "boolean":
				if( value === true || value === "true" || value === "1" || value === 1 ){
					value = true;
				}else if( value === false || value === "false" || value === "0" || value === 0 ){
					value = false;
				}else{
					value = oldValue;
				}
				break;
			
			default:
				return false;
		}
		
		if( oldValue !== value ){
			this[key] = value;
			return true;
		}
		
		return false;
	}
	
	fromJSON(json){
		if(!json){
			json = {};
		}
		
		let needsRestart = false;
		
		for(const key in json){
			if( this.set(key, json[key]) ){
				needsRestart = true;
			}
		}
		
		return needsRestart;
	}
	
	async load(path){
		const data = await fsp.readFile(path);
		const json = JSON.parse(data.toString());
		return this.fromJSON(json);
	}
	
	async save(path){
		await fsp.writeFile(path, JSON.stringify(this, null, 4));
	}
	
	watch(path, callback){
		return fs.watch(path, (eventType, filename) => {
			callback(path, eventType);
		});
	}
}

module.exports = Config;
