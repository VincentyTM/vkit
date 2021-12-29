(function($){

var queryParams = $.queryParams;

function getBase(url){
	var qmp = url.indexOf("?");
	if( qmp === -1 ){
		return url;
	}
	return url.substring(0, qmp);
}

function getQueryParams(url){
	var qmp = url.indexOf("?");
	if( qmp === -1 ){
		return queryParams("");
	}
	return queryParams(url.substring(qmp+1));
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

$.url = URL;

})($);
