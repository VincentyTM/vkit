const fs = require("fs");

async function readDirectory(dir, handleItem, {signal} = {}){
	return await new Promise((resolve, reject) => (
		fs.readdir(dir, async function(err, files){
			if( err ){
				reject(err);
				return;
			}
			
			if( signal && signal.aborted ){
				reject(signal.reason);
				return;
			}
			
			await Promise.all(
				files.map(async file => {
					const path = dir + "/" + file;
					
					try{
						await readDirectory(path, handleItem, {signal});
					}catch(ex){
						if( ex.code === "ENOTDIR" ){
							if( signal && signal.aborted ){
								reject(signal.reason);
							}else{
								handleItem(path);
							}
						}else{
							reject(ex);
						}
					}
				})
			);
			
			resolve();
		})
	));
}

module.exports = readDirectory;
