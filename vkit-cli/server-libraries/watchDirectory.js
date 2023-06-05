const fs = require("fs");

function watchDirectory(directory, callback, onError){
	let watch = null;
	
	try{
		watch = fs.watch(directory, {recursive: true}, (eventType, filename) => {
			callback(directory + "/" + filename.split("\\").join("/"), eventType);
		}).on("error", onError);
	}catch(ex){
		onError(ex);
	}
	
	return {
		close(){
			if( watch ){
				watch.close();
				watch = null;
			}
		}
	};
}

module.exports = watchDirectory;
