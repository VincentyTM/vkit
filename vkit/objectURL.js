(function($, global){

var createState = $.state;
var unmount = $.unmount;
var URL = global.URL || global.webkitURL || global.mozURL;

function createObjectURL(file){
	if(!URL){
		throw new Error("File URL is not supported");
	}
	
	if(!file && file !== ""){
		return null;
	}
	
	if( file.effect ){
		var urlState = createState("");
		
		function revoke(){
			var url = urlState.get();
			if( url ){
				URL.revokeObjectURL(url);
			}
		}
		
		file.effect(function(value){
			revoke();
			urlState.set(value ? (typeof value === "string" ? value : URL.createObjectURL(value)) : "");
		});
		
		unmount(revoke);
		
		return urlState;
	}
	
	var url = typeof file === "string" ? file : URL.createObjectURL(file);
	
	unmount(function(){
		URL.revokeObjectURL(url);
	});
	
	return url;
}

$.objectURL = createObjectURL;

})($, this);
