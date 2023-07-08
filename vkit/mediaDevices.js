(function($, navigator){

var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;
var update = $.update;

function mediaDevices(onError, nav){
	if(!nav){
		nav = navigator;
	}
	
	var devices = createState([]);
	
	function fetchDevices(){
		nav.mediaDevices.enumerateDevices().then(function(list){
			devices.set(list);
			update();
		}, function(error){
			if( typeof onError === "function" ){
				onError(error);
			}
			
			update();
		});
	}
	
	if( nav.mediaDevices && typeof nav.mediaDevices.enumerateDevices === "function" ){
		unmount(
			onEvent(nav.mediaDevices, "devicechange", fetchDevices)
		);
		
		fetchDevices();
	}else if( typeof onError === "function" ){
		onError(new Error("MediaDevices API is not supported"));
	}
	
	return devices.map();
}

$.mediaDevices = mediaDevices;

})($, navigator);
