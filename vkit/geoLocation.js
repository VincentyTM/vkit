(function($){

var createSignal = $.signal;
var getWindow = $.window;
var onUnmount = $.unmount;
var update = $.update;

function createGeoLocationState(options, onError, geolocation){
	if(!geolocation){
		geolocation = getWindow().navigator.geolocation;
	}
	
	var signal = createSignal({});
	
	function updatePosition(position){
		signal.set(position);
		update();
	}
	
	function handleError(error){
		if( typeof onError === "function" ){
			onError(error);
			update();
		}
	}
	
	if( geolocation ){
		var id = geolocation.watchPosition(updatePosition, handleError, options);
		
		onUnmount(function(){
			geolocation.clearWatch(id);
		});
	}else if( typeof onError === "function" ){
		onError(new ReferenceError("GeoLocation API is not supported"));
	}
	
	return signal.map();
}

$.geoLocation = createGeoLocationState;

})($);
