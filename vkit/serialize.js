(function($){

function serialize(form, append){
	var submitButton = form.ownerDocument.activeElement;
	for(var i=0, l=form.elements.length; i<l; ++i){
		var input=form.elements[i];
		if(!input.name || input.disabled){
			continue;
		}
		switch( input.type ){
			case 'submit': case 'image':
				if( input === submitButton )
					append(input.name, input.value);
				break;
			case 'button': case 'reset':
				break;
			case 'file':
				if( input.files ){
					var n = input.files.length;
					if( n === 0 ){
						append(input.name, "");
					}else{
						for(var k=0; k<n; ++k){
							append(input.name, input.files[k].name);
						}
					}
				}else{
					append(input.name, input.value);
				}
				break;
			case 'checkbox': case 'radio':
				if( input.checked )
					append(input.name, input.value);
				break;
			case 'select-multiple':
				for(var j=0, lj=input.options.length; j<lj; ++j){
					var option = input.options[j];
					option.selected && append(input.name, option.value);
				}
				break;
			default:
				append(input.name, input.value);
		}
	}
}

$.serialize = serialize;

})($);
