import path from "path";
import url from "url";
import addDirectoryToCache from "./addDirectoryToCache.js";
import createFileCache from "./createFileCache.js";
import initSrcDirectory from "./initSrcDirectory.js";
import initWwwDirectory from "./initWwwDirectory.js";
import readCommandLineArguments from "./readCommandLineArguments.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class FileCacheManager {
	firstChangeReady = false;
	allowChangeEvents = false;
	templatesBasePath = __dirname + "/templates/";
	templateName = "default";
	srcDirWatcher = null;
	wwwDirWatcher = null;
	
	constructor(config, handleChanges, output) {
		this.config = config;
		
		this.fileCache = createFileCache((changes) => {
			if (!this.allowChangeEvents) {
				return;
			}
			
			if (!this.firstChangeReady) {
				this.firstChangeReady = true;
				return;
			}
			
			handleChanges(changes, this.fileCache);
		});
		
		this.output = output;
		
		readCommandLineArguments((key, value) => {
			if (key === "template" && /[a-zA-Z0-9_\-]+/.test(value)) {
				this.templateName = value;
			}
		});
	}
	
	async initDirectories() {
		await Promise.all([
			this.initSrcDirectory(),
			this.initWwwDirectory()
		]);
	}
	
	async updateDirectories() {
		this.output.startLoadingFileCache();
		this.fileCache.clear();
		
		await Promise.all([
			this.initSrcDirectory(),
			this.initWwwDirectory()
		]);
		
		this.output.finishLoadingFileCache();
	}
	
	async initSrcDirectory() {
		if (this.srcDirWatcher) {
			this.srcDirWatcher.close();
			this.srcDirWatcher = null;
		}
		
		const {config} = this;
		
		this.srcDirWatcher = await initSrcDirectory(
			this.fileCache,
			config.srcDir,
			this.templatesBasePath + this.templateName + "/src",
			(err) => this.output.srcDirError(err)
		);
	}
	
	async initWwwDirectory() {
		if (this.wwwDirWatcher) {
			this.wwwDirWatcher.close();
			this.wwwDirWatcher = null;
		}
		
		const {config} = this;
		
		this.wwwDirWatcher = await initWwwDirectory(
			config.wwwDir,
			this.templatesBasePath + this.templateName + "/www",
			(err) => this.output.wwwDirError(err)
		);
	}
	
	async rebuild() {
		this.fileCache.clear();
		await addDirectoryToCache(this.config.srcDir, this.fileCache);
	}
	
	ready() {
		this.allowChangeEvents = true;
	}
}
