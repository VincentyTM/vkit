function createHttpError(status, message = null){
	if(!(status >= 400 && status <= 599)){
		throw new Error("Invalid status code " + status);
	}
	
	const error = new Error(message ? message : "Http error " + status);
	error.status = status;
	return error;
}

module.exports = createHttpError;
