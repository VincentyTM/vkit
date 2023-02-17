(function($, global){

var URL = global.URL || global.webkitURL || global.mozURL;

function createObjectURL(file){
	if(!URL){
		throw new Error("File URL is not supported");
	}
	
	if(!file){
		return null;
	}
	
	if( file.effect ){
		var urlState = $.state("");
		
		function revoke(){
			var url = urlState.get();
			if( url ){
				URL.revokeObjectURL(url);
			}
		}
		
		file.effect(function(file){
			revoke();
			urlState.set(file ? URL.createObjectURL(file) : "");
		});
		
		$.unmount(revoke);
		
		return urlState;
	}
	
	var url = URL.createObjectURL(file);
	
	$.unmount(function(){
		URL.revokeObjectURL(url);
	});
	
	return url;
}

$.objectURL = createObjectURL;

})($, this);
