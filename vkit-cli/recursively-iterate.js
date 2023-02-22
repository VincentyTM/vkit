const fs = require("fs");

const recursivelyIterate = (dir, array = []) => (
	new Promise((resolve, reject) => {
		fs.readdir(dir, function(err, files){
			if( err ){
				return reject("Can't access directory '" + dir + "': " + err);
			}
			let count = files.length;
			if( count === 0 ){
				return resolve(array);
			}
			for(const file of files){
				const path = dir + "/" + file.split("\\").join("/");
				fs.stat(path, async function(err, stat){
					if( err )
						return reject("Error while reading '" + path + "': " + err);
					
					if( stat.isDirectory() ){
						await recursivelyIterate(path, array);
					}else{
						array.push(path);
					}
					--count === 0 && resolve(array);
				});
			}
		});
	})
);

module.exports = recursivelyIterate;
