const isCSS = require("./isCSS");

module.exports = () => {
	const watchers = [];
	
	return {
		reload({
			config: {
				srcDir,
				srcPath
			},
			changes,
			fileCache
		}){
			const n = watchers.length;
			
			if( n === 0 ){
				return;
			}
			
			const paths = Object.keys(changes);
			const message = paths.every(isCSS)
				? paths
					.map(path => path
						.replace(srcDir + "/", srcPath)
						+ "\n"
						+ (changes[path] === null ? "" : fileCache.getVersion(path))
					)
					.join("\n")
				: "";
			const length = Buffer.byteLength(message);
			
			for(const res of watchers.splice(0, n)){
				res.writeHead(200, {
					"content-type": "text/plain; charset=utf-8",
					"content-length": length
				}).end(message);
			}
		},
		watch(res){
			watchers.push(res);
		}
	};
};
