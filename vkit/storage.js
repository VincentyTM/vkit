(function($){

var createSignal = $.signal;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function useStorage(storage, key, win){
	var signal = createSignal(storage.getItem(key));
	
	signal.subscribe(function(value){
		if( value === null ){
			storage.removeItem(key);
		}else{
			storage.setItem(key, value);
		}
	});
	
	onUnmount(
		onEvent(win || getWindow(), "storage", function(e){
			if( e.storageArea === storage && e.key === key ){
				signal.set(e.newValue);
			}
		})
	);
	
	return signal;
}

$.storage = useStorage;

})($);
