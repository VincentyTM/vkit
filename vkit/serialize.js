(function($){

function serialize(form, callback){
	var submitButton = form.ownerDocument.activeElement;
	var n = form.elements.length;
	for(var i=0; i<n; ++i){
		var input = form.elements[i];
		if(!input.name || input.disabled){
			continue;
		}
		switch( input.type ){
			case "submit": case "image":
				if( input === submitButton ){
					callback(input.name, input.value);
				}
				break;
			case "button": case "reset":
				break;
			case "file":
				if( input.files ){
					var n = input.files.length;
					if( n === 0 ){
						callback(input.name, "");
					}else{
						for(var k=0; k<n; ++k){
							callback(input.name, input.files[k].name);
						}
					}
				}else{
					callback(input.name, input.value);
				}
				break;
			case "checkbox": case "radio":
				if( input.checked ){
					callback(input.name, input.value);
				}
				break;
			case "select-multiple":
				var m = input.options.length;
				for(var j=0; j<m; ++j){
					var option = input.options[j];
					option.selected && callback(input.name, option.value);
				}
				break;
			default:
				callback(input.name, input.value);
		}
	}
}

$.serialize = serialize;

})($);
