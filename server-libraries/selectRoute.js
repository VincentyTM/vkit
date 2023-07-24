const createHttpError = require("./createHttpError");
const file = require("./file");
const getPath = require("./getPath");
const getSearch = require("./getSearch");
const redirect = require("./redirect");
const sanitizePath = require("./sanitizePath");
const X_REQUESTED_WITH = "XMLHttpRequest";

module.exports = async (
	req,
	res,
	routes,
	errorRoutes,
	staticRoot
) => {
	try{
		const method = req.method.toLowerCase();
		
		if( method !== "get" && method !== "head" && method !== "options" && req.headers["x-requested-with"] !== X_REQUESTED_WITH ){
			throw createHttpError(400, "Request blocked to avoid CSRF");
		}
		
		const path = getPath(req);
		const segments = path.split("/");
		const majorRoute = routes[segments[1] || ""];
		
		if( majorRoute ){
			const minorRoute = majorRoute[method + "_" + (segments[2] || "")];
			
			if( minorRoute ){
				await minorRoute(req, res, segments.slice(3));
			}else if( majorRoute[method] ){
				if( segments.length <= 2 ){
					redirect(res, path + "/" + getSearch(req));
				}else{
					await majorRoute[method](req, res, segments.slice(2));
				}
			}
		}else{
			await file(req, res, staticRoot + sanitizePath(path));
		}
	}catch(error){
		if(!error.status){
			throw error;
		}
		
		const route = errorRoutes[error.status] || errorRoutes["500"];
		await route(req, res);
	}
};
