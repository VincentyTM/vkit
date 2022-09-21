(function($, undefined){

var inject = $.inject;
var createObjectState = $.objectState;

function Store(){
	this.state = createObjectState({});
}

function map(){
	return inject(Store).state.map.apply(null, arguments);
}

function select(){
	return inject(Store).state.select.apply(null, arguments);
}

$.store = {
	provider: Store,
	map: map,
	select: select
};

})($);