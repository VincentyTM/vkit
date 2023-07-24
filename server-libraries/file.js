const fs = require("fs");
const cache = require("./cache.js");
const getMimeType = require("./getMimeType.js");

module.exports = async (
	req,
	res,
	path,
	status = 200,
	cacheDuration = 0
) => await new Promise((resolve, reject) => {
	fs.lstat(path, (err, stats) => {
		if( err || !stats || !stats.isFile() ){
			reject({
				status: 404
			});
			return;
		}
		
		if( cache(req, res, stats.mtimeMs, cacheDuration) ){
			return;
		}
		
		res.setHeader("accept-ranges", "bytes");
		
		if(!res.getHeader("content-type")){
			res.setHeader("content-type", getMimeType(path));
		}
		
		const range = req.headers.range;
		const size = stats.size;
		let start = 0;
		let end = size;
		
		if( range ){
			const parts = range.replace("bytes=", "").split("-");
			start = parseInt(parts[0]);
			end = parts[1] ? parseInt(parts[1]) : size - 1;
			
			if( start >= size || start > end || start < 0 || isNaN(start) || end > size ){
				reject({
					status: 416
				});
				return;
			}
			
			res.setHeader("content-range", "bytes " + start + "-" + end + "/" + size);
			res.setHeader("content-length", end - start + 1);
			res.writeHead(206, {});
		}else{
			res.setHeader("content-length", size);
			res.writeHead(status, {});
		}
		
		if( req.method.toLowerCase() === "head" ){
			res.end();
			resolve();
			return;
		}
		
		const stream = fs.createReadStream(path, {
			"start": start,
			"end": end
		});
		
		stream.on("error", (err) => {
			res.end();
			reject(err);
		});
		
		stream.on("finish", () => {
			res.end();
			resolve();
		});
		
		stream.on("open", () => {
			stream.pipe(res);
		});
	});
});

