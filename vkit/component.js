(function($, document){

function createComponent(parent){
	return {
		parent: parent,
		emitError: null,
		unmount: null
	};
}

$.component = createComponent;

})($, document);
