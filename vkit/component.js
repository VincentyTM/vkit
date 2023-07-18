(function($, document){

function createComponent(parent){
	return {
		index: 0,
		parent: parent,
		emitError: null,
		unmount: null
	};
}

$.component = createComponent;

})($, document);
