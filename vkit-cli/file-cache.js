const fs = require("fs");
const recursivelyIterate = require("./recursively-iterate.js");

class FileCache {
	constructor(onComplete){
		this.cache = {};
		this.taskCount = 0;
		this.onComplete = onComplete;
	}
	get(src){
		return this.cache[src] || null;
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
			console.error("The directory", directory, "doesn't exist.");
		}
	}
	async updateDirectory(directory){
		try{
			const files = await recursivelyIterate(directory);
			for(const file of files){
				await this.update(file);
			}
		}catch(ex){
		}
	}
	async update(src){
		++this.taskCount;
		const cache = this.cache;
		try{
			const content = await this.readFile(src);
			if( cache[src] !== content ){
				cache[src] = content;
				console.log("Updating", src);
			}else{
				//console.log("Skipping", src);
			}
		}catch(ex){
			switch(ex.code){
				case "EISDIR":
					break;
				case "ENOENT":
					delete cache[src];
					console.log("Deleting", src);
					break;
				default:
					console.error("Can't read", src, "as", ex);
			}
		}
		if( --this.taskCount==0 ){
			await this.onComplete();
			console.log("  Done!");
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
