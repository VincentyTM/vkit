(function($) {

var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var signal = $.signal;

function useStorage(storageArea, key) {
	var win = getWindow();
	var storage = signal(storageArea.getItem(key));
	
	storage.subscribe(function(value) {
		if (value === null) {
			storageArea.removeItem(key);
		} else {
			storageArea.setItem(key, value);
		}
	});
	
	if (win) {
		onUnmount(
			onEvent(win, "storage", function(e) {
				if (e.storageArea === storageArea && e.key === key) {
					storage.set(e.newValue);
				}
			})
		);
	}
	
	return storage;
}

$.storage = useStorage;

})($);
