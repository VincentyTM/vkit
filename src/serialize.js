(function($){

$.serialize=function(form, append){
	var submitButton=form.ownerDocument.activeElement;
	for(var i=0, l=form.elements.length; i<l; ++i){
		var input=form.elements[i];
		if(!input.name){
			continue;
		}
		switch( input.type ){
			case 'submit': case 'image':
				if( input===submitButton )
					append(input.name, input.value);
				break;
			case 'button': case 'reset': case 'file':
				break;
			case 'checkbox': case 'radio':
				if( input.checked )
					append(input.name, input.value);
				break;
			case 'select-multiple':
				for(var j=0, lj=input.options.length; j<lj; ++j){
					var option=input.options[j];
					option.selected && append(input.name, option.value);
				}
				break;
			default:
				append(input.name, input.value);
		}
	}
};

})($);
