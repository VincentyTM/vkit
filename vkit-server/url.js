var queryParams = require("./queryParams.js");

function removeHash(url){
	var hmp = url.indexOf("#");
	return hmp === -1 ? url : url.substring(0, hmp);
}

function getBase(url){
	url = removeHash(url);
	var qmp = url.indexOf("?");
	return qmp === -1 ? url : url.substring(0, qmp);
}

function getQueryParams(url){
	url = removeHash(url);
	var qmp = url.indexOf("?");
	return queryParams(qmp === -1 ? "" : url.substring(qmp+1));
}

function URL(url){
	if( url.map ){
		return {
			base: url.map(getBase),
			queryParams: url.map(getQueryParams)
		};
	}else{
		return {
			base: getBase(url),
			queryParams: getQueryParams(url)
		};
	}
}

module.exports = URL;
