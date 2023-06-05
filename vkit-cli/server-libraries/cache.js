const noCache = require("./noCache.js");

module.exports = (req, res, lastModified = 0, cacheDuration = 0) => {
	if( cacheDuration <= 0 ){
		noCache(res);
		return false;
	}
	
	res.setHeader("cache-control", "public, max-age=" + cacheDuration + ", stale-while-revalidate=60480000, stale-if-error=60480000");
	res.setHeader("expires", new Date(new Date().getTime() + cacheDuration * 1000).toUTCString());
	res.setHeader("last-modified", new Date(lastModified).toUTCString());
	const ifModifiedSince = req.headers["if-modified-since"];
	
	if( ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastModified ){
		res.writeHead(304, {}).end();
		return true;
	}
	
	return false;
};
