(function($){

var classNames = $.classNames;

function classes(c){
	return {
		className: classNames(c)
	};
}

$.classes = classes;

})($);
