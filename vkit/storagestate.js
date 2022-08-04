(function($, window){

var unmount = $.unmount;
var onEvent = $.onEvent;
var createState = $.state;

function createStorageState(storage, key, win){
	var state = createState(storage.getItem(key));
	state.onChange.subscribe(function(value){
		if( value === null ){
			storage.removeItem(key);
		}else{
			storage.setItem(key, value);
		}
	});
	unmount(
		onEvent(win || window, "storage", function(e){
			if( e.storageArea === storage && e.key === key ){
				state.set(e.newValue);
			}
		})
	);
	return state;
}

$.storageState = createStorageState;

})($, window);
