(function($){

function getArgs(){
	return arguments;
}

function combinedEffect(callback){
	this.map(getArgs).effect(function(args){
		callback.apply(null, args);
	});
}

function combinedView(getView){
	return this.map(getArgs).view(function(args){
		return getView.apply(null, args);
	});
}

$.fn.effect = combinedEffect;
$.fn.view = combinedView;

})($);
