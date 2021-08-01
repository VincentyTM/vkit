const fs = require("fs");
const getMimeType = require("./get-mime-type.js");

function serveFile(req, res, path){
	const headers = {};
	fs.lstat(path, function(err, stats){
		if( err || !stats || !stats.isFile() ){
			res.writeHead(404, {
				"content-type": "text/plain",
				"content-length": 3
			});
			res.end("404");
			return;
		}
		if(!recent(stats.mtimeMs, headers, req)){
			res.writeHead(304, {
				"content-length": 0
			});
			res.end();
			return;
		}
		headers["content-type"]=getMimeType(path);
		headers["accept-ranges"]="bytes";
		const size=stats.size;
		let start=0;
		let end=size;
		const range=req.headers.range;
		if( range ){
			const parts=range.replace("bytes=", "").split("-");
			start=parseInt(parts[0]);
			end=parts[1] ? parseInt(parts[1]) : size-1;
			if( start>=size || start>end || start<0 || isNaN(start) || end>size ){
				res.writeHead(416, {
					"content-type": "text/plain",
					"content-length": 3
				});
				res.end("416");
				return;
			}
			headers["content-range"]="bytes "+start+"-"+end+"/"+size;
			headers["content-length"]=end-start+1;
			res.writeHead(206, headers);
		}else{
			headers["content-length"]=size;
			res.writeHead(200, headers);
		}
		if( req.method.toLowerCase()==="head" ){
			res.end();
			return;
		}
		const stream = fs.createReadStream(path, {
			"start": start,
			"end": end
		});
		stream.on("error", function(){ res.end(); });
		stream.on("finish", function(){ res.end(); });
		stream.on("open", function(){ stream.pipe(res); });
	});
}

function recent(lastModified, headers, req){
	headers["vary"] = "if-modified-since";
	headers["cache-control"] = "public, max-age=60, no-transform, immutable, min-fresh: 60, stale-while-revalidate=30, stale-if-error=30";
	headers["expires"] = new Date(Date.now() + 300000).toUTCString();
	headers["last-modified"] = new Date(lastModified).toUTCString();
	return !( "if-modified-since" in req.headers && new Date(req.headers["if-modified-since"]).getTime() >= lastModified );
}

module.exports = serveFile;
