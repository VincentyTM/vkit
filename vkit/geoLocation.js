(function($, navigator){

var createState = $.state;
var unmount = $.unmount;
var render = $.render;

function createGeoLocationState(options, onError, geolocation){
	if(!geolocation){
		geolocation = navigator.geolocation;
	}
	
	var state = createState({});
	
	function update(position){
		state.set(position);
		render();
	}
	
	function handleError(error){
		if( typeof onError === "function" ){
			onError(error);
			render();
		}
	}
	
	if( geolocation ){
		var id = geolocation.watchPosition(update, handleError, options);
		
		unmount(function(){
			geolocation.clearWatch(id);
		});
	}else if( typeof onError === "function" ){
		onError(new ReferenceError("GeoLocation API is not supported"));
	}
	
	return state.map();
}

$.geoLocation = createGeoLocationState;

})($, navigator);
