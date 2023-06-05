const addDirectoryToCache = require("./addDirectoryToCache");
const createFileCache = require("./createFileCache");
const initSrcDirectory = require("./initSrcDirectory");
const initWwwDirectory = require("./initWwwDirectory");

class FileCacheManager {
	firstChangeReady = false;
	allowChangeEvents = false;
	templatesBasePath = __dirname + "/templates/";
	templateName = "default";
	srcDirWatcher = null;
	wwwDirWatcher = null;
	
	constructor(config, handleChanges, output){
		this.config = config;
		
		this.fileCache = createFileCache((changes) => {
			if(!this.allowChangeEvents){
				return;
			}
			
			if(!this.firstChangeReady){
				this.firstChangeReady = true;
				return;
			}
			
			handleChanges(changes, this.fileCache);
		});
		
		this.output = output;
	}
	
	async initDirectories(){
		await Promise.all([
			this.initSrcDirectory(),
			this.initWwwDirectory()
		]);
	}
	
	async updateDirectories(){
		this.output.startLoadingFileCache();
		this.fileCache.clear();
		await Promise.all([
			this.initSrcDirectory(),
			this.initWwwDirectory()
		]);
		this.output.finishLoadingFileCache();
	}
	
	async initSrcDirectory(){
		if( this.srcDirWatcher ){
			this.srcDirWatcher.close();
			this.srcDirWatcher = null;
		}
		
		const {config} = this;
		this.srcDirWatcher = await initSrcDirectory(
			this.fileCache,
			config.srcDir,
			this.templatesBasePath + this.templateName + "/src",
			err => this.output.srcDirError(err)
		);
	}
	
	async initWwwDirectory(){
		if( this.wwwDirWatcher ){
			this.wwwDirWatcher.close();
			this.wwwDirWatcher = null;
		}
		
		const {config} = this;
		this.wwwDirWatcher = await initWwwDirectory(
			config.wwwDir,
			this.templatesBasePath + this.templateName + "/www",
			err => this.output.wwwDirError(err)
		);
	}
	
	async rebuild(){
		this.fileCache.clear();
		await addDirectoryToCache(this.config.srcDir, this.fileCache);
	}
	
	ready(){
		this.allowChangeEvents = true;
	}
}

module.exports = FileCacheManager;
