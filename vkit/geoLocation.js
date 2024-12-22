(function($) {

var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function useGeoLocation(options) {
	var geolocation = getWindow().navigator.geolocation;
	var error = signal(null);
	var pos = signal({});
	
	function updatePosition(position) {
		pos.set(position);
		update();
	}
	
	function handleError(ex) {
		error.set(ex);
		update();
	}
	
	if (geolocation) {
		var id = geolocation.watchPosition(updatePosition, handleError, options);
		
		onUnmount(function() {
			geolocation.clearWatch(id);
		});
	} else {
		error.set(new ReferenceError("GeoLocation API is not supported"));
	}
	
	var result = readOnly(pos);
	result.onError = error.subscribe;
	return result;
}

$.geoLocation = useGeoLocation;

})($);
