import fs from "fs";

export default function createFileCache(callback) {
	let changes = null;
	const cache = {};
	
	async function update(path, eventType) {
		if (eventType === "rename") {
			delete cache[path];
			return;
		}
		
		const item = cache[path] || (cache[path] = {
			status: "ready",
			value: null,
			version: Date.now()
		});
		
		if (item.status !== "ready") {
			item.status = "queued";
			return;
		}
		
		item.status = "reading";
		startTask();
		
		await new Promise((resolve, reject) => {
			fs.readFile(path, (err, data) => {
				if (item.status === "queued") {
					item.status = "ready";
					update(path).then(() => {
						finishTask();
						resolve();
					}, (err) => {
						finishTask();
						reject(err);
					});
				} else if(err) {
					switch (err.code) {
						case "ENOENT":
						case "EISDIR":
							delete cache[path];
							
							if (changes) {
								changes.updated[path] = null;
							}
							
							finishTask();
							resolve();
							break;
						default:
							item.status = "ready";
							finishTask();
							reject(err);
					}
				} else {
					item.status = "ready";
					const string = data.toString();
					
					if (string !== item.value) {
						item.value = string;
						item.version = Date.now();
					}
					
					if (changes) {
						changes.updated[path] = string;
					}
				
					finishTask();	
					resolve();
				}
			});
		});
	}
	
	function startTask() {
		if (changes) {
			++changes.taskCount;
		} else {
			changes = {
				taskCount: 1,
				updated: {}
			};
		}
	}
	
	function finishTask() {
		if (changes && --changes.taskCount === 0) {
			const {updated} = changes;
			changes = null;
			callback(updated);
		}
	}
	
	function get(path) {
		const item = cache[path];
		return item ? item.value : null;
	}
	
	function getVersion(path) {
		const item = cache[path];
		return item ? item.version : null;
	}
	
	function keys() {
		return Object.keys(cache).filter(path => cache[path].value !== null);
	}
	
	function clear() {
		for (const key in cache) {
			delete cache[key];
		}
	}
	
	return {
		clear,
		finishTask,
		get,
		getVersion,
		keys,
		startTask,
		update
	};
};
