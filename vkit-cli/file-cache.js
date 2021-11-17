const fs = require("fs");
const recursivelyIterate = require("./recursively-iterate.js");

class FileCache {
	constructor(onComplete){
		this.cache = {};
		this.taskCount = 0;
		this.visibleTaskCount = 0;
		this.onComplete = onComplete;
		this.updated = {};
		this.deleted = {};
	}
	getVersionString(src){
		const item = this.cache[src];
		return item ? "?v=" + item.version : "";
	}
	getKeys(){
		return Object.keys(this.cache);
	}
	get(src){
		const item = this.cache[src];
		return item ? item.content : null;
	}
	clear(){
		const cache = this.cache;
		for(const key in cache){
			delete cache[key];
		}
	}
	watchDirectory(directory){
		try{
			const watch = fs.watch(directory, {recursive: true}, (eventType, filename) => this.update(directory + "/" + filename.split("\\").join("/")));
			watch.on("error", err => {
				console.error("Error:", err);
			});
			return watch;
		}catch(ex){
			console.error("The directory '" + directory + "' doesn't exist.");
		}
	}
	async updateDirectory(directory){
		try{
			const files = await recursivelyIterate(directory);
			for(const file of files){
				await this.update(file);
			}
		}catch(ex){
			console.error("Error while loading directory '" + directory + "'.");
		}
	}
	async update(src){
		++this.taskCount;
		const cache = this.cache;
		try{
			const content = await this.readFile(src);
			if(!(src in cache) || cache[src].content !== content){
				cache[src] = {
					content,
					version: Date.now()
				};
				this.updated[src] = true;
				console.log("Updating", src);
				++this.visibleTaskCount;
			}
		}catch(ex){
			switch(ex.code){
				case "EISDIR":
					break;
				case "ENOENT":
					delete cache[src];
					this.deleted[src] = true;
					console.log("Deleting", src);
					++this.visibleTaskCount;
					break;
				default:
					console.error("Error while reading '" + src + "'.");
			}
		}
		if( --this.taskCount==0 ){
			await this.onComplete(this.updated, this.deleted);
			this.updated = {};
			this.deleted = {};
			if( this.visibleTaskCount > 0 ){
				this.visibleTaskCount = 0;
				console.log("  Done!");
			}
		}
	}
	async readFile(src){
		return await new Promise((resolve, reject) => 
			fs.readFile(src, (err, data) =>
				err ? reject(err) : resolve(data.toString())
			)
		);
	}
}

module.exports = FileCache;
