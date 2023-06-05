const {promises: fsp} = require("fs");
const process = require("process");
const createConfig = require("./createConfig");
const readCommandLineArguments = require("./readCommandLineArguments");

class ConfigManager {
	config = createConfig();
	cwdSet = false;
	
	constructor(configFilePath, handleLoad, output){
		this.configFilePath = configFilePath;
		this.handleLoad = handleLoad;
		this.output = output;
	}
	
	async load(){
		this.setCurrentWorkingDirectory();
		this.loadFromCommandLineArgs();
		const needsRestart = await this.loadFromFile();
		this.loadFromCommandLineArgs();
		return needsRestart;
	}
	
	async reload(){
		if( await this.load() ){
			this.handleLoad();
		}
	}
	
	async loadFromFile(){
		try{
			return await this.config.load(this.configFilePath);
		}catch(ex){
			if( ex.code === "ENOENT" ){
				await this.config.save(this.configFilePath);
				return false;
			}else{
				throw ex;
			}
		}
	}
	
	setCurrentWorkingDirectory(){
		if( this.cwdSet ){
			return;
		}
		
		this.cwdSet = true;
		
		readCommandLineArguments(async (key, value) => {
			if( key === null ){
				if(!value) value = ".";
				await fsp.mkdir(value, {recursive: true});
				process.chdir(value);
			}
		});
	}
	
	loadFromCommandLineArgs(){
		const {config} = this;
		
		readCommandLineArguments((key, value) => {
			if( key !== null ){
				config.set(key, value);
			}
		});
	}
	
	watch(){
		this.config.watch(this.configFilePath, () => {
			this.reload();
		}).on("error", err => this.output.configWatchError(err));
	}
}

module.exports = ConfigManager;
