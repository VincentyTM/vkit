(function($) {

var isSignal = $.isSignal;
var queryParams = $.queryParams;

function removeHash(url) {
	var hmp = url.indexOf("#");
	return hmp === -1 ? url : url.substring(0, hmp);
}

function getBase(url) {
	url = removeHash(url);
	var qmp = url.indexOf("?");
	return qmp === -1 ? url : url.substring(0, qmp);
}

function getQueryParams(url) {
	url = removeHash(url);
	var qmp = url.indexOf("?");
	return queryParams(qmp === -1 ? "" : url.substring(qmp + 1));
}

function parseURL(url) {
	if (isSignal(url)) {
		return {
			base: url.map(getBase),
			queryParams: url.map(getQueryParams)
		};
	}
	
	return {
		base: getBase(url),
		queryParams: getQueryParams(url)
	};
}

$.parseURL = parseURL;

})($);
