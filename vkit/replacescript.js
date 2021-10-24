(function($, undefined){

$.replaceScript = function(getView){
	var script = $.currentScript();
	var parent = script.parentNode;
	var view = typeof getView === "function" ? getView(script) : getView;
	var n = view.length;
	for(var i=0; i<n; ++i){
		parent.insertBefore(view[i], script);
	}
	parent.removeChild(script);
	return view;
};

})($);
