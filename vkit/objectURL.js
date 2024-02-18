(function($, global){
var effect = $.effect;
var onUnmount = $.onUnmount;

var createState = $.state;
var URL = global.URL || global.webkitURL || global.mozURL || {
	createObjectURL: function(){ return ""; },
	revokeObjectURL: function(){}
};

function createObjectURL(file){
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
		
		function setURL(value) {
			revoke();
			urlState.set(value ? (typeof value === "string" ? value : URL.createObjectURL(value)) : "");
		}
		
		if (typeof file.effect === "function") {
			file.effect(setURL);
		} else {
			effect(function() {
				setURL(file());
			});
		}
		
		onUnmount(revoke);
		
		return urlState;
	}
	
	var url = typeof file === "string" ? file : URL.createObjectURL(file);
	
	onUnmount(function() {
		URL.revokeObjectURL(url);
	});
	
	return url;
}

$.objectURL = createObjectURL;

})($, this);
