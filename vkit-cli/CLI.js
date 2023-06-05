const ConfigManager = require("./ConfigManager");
const ConsoleOutput = require("./ConsoleOutput");
const createReloader = require("./createReloader");
const DevServerManager = require("./DevServerManager");
const ExportManager = require("./ExportManager");
const FileCacheManager = require("./FileCacheManager");
const LibraryManager = require("./LibraryManager");
const listenToCommands = require("./listenToCommands");

class CLI {
	output = new ConsoleOutput();
	
	configManager = new ConfigManager(
		"./config.json",
		this.handleConfigReload.bind(this),
		this.output
	);
	
	reloader = createReloader(this.configManager.config);
	
	fileCacheManager = new FileCacheManager(
		this.configManager.config,
		this.handleFileCacheChanges.bind(this),
		this.output
	);
	
	libraryManager = new LibraryManager(
		this.output
	);
	
	exportManager = new ExportManager({
		config: this.configManager.config,
		fileCache: this.fileCacheManager.fileCache,
		libraryContainer: this.libraryManager.libraryContainer,
		output: this.output
	});
	
	devServerManager = new DevServerManager({
		config: this.configManager.config,
		fileCache: this.fileCacheManager.fileCache,
		libraryContainer: this.libraryManager.libraryContainer,
		output: this.output,
		reloader: this.reloader
	});
	
	async handleConfigReload(){
		await Promise.all([
			this.fileCacheManager.updateDirectories(),
			this.devServerManager.restartDevServer()
		]);
		
		if( this.configManager.config.startBrowser ){
			this.devServerManager.startBrowser();
		}
		
		this.output.configReloaded();
	}
	
	handleFileCacheChanges(changes, fileCache){
		this.reloader.reload({
			config: this.configManager.config,
			changes,
			fileCache
		});
		
		this.output.logFileChanges(changes);
		
		if( this.configManager.config.autoExport ){
			this.exportManager.exportApp();
		}
	}
	
	async start(){
		this.output.startLoading();
		
		await Promise.all([
			this.configManager.load(),
			this.libraryManager.loadLibraries()
		]);
		
		this.configManager.watch();
		
		await Promise.all([
			this.devServerManager.startDevServer(),
			this.fileCacheManager.initDirectories()
		]);
		
		listenToCommands({
			exportApp: () => this.exportManager.exportApp(),
			loadConfig: () => this.configManager.reload(),
			output: this.output,
			rebuild: () => this.fileCacheManager.rebuild(),
			reload: () => this.reloader.reload({
				config: this.configManager.config,
				changes: {},
				fileCache: this.fileCacheManager.fileCache
			}),
			startBrowser: () => this.devServerManager.startBrowser()
		});
		
		this.fileCacheManager.ready();
		this.output.finishLoading();
		
		if( this.configManager.config.startBrowser ){
			this.devServerManager.startBrowser();
		}
	}
}

module.exports = CLI;
