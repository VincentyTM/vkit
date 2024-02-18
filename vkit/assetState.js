(function($) {

var effect = $.effect;
var onUnmount = $.onUnmount;
var signal = $.signal;

function createAssetState(refs, assetName, defaultValue) {
	var state = signal();
	
	function setAssetName(name, onCleanup) {
		if (!name && name !== "") {
			state.set(defaultValue);
			return;
		}
		
		var asset = refs.add(name);
		state.set(asset.isFulfilled() ? asset.get() : defaultValue);
		
		var removeLoadHandler = asset.onLoad(function(value) {
			state.set(value);
		});
		
		var removeResetHandler = asset.onReset(function() {
			state.set(defaultValue);
		});
		
		onCleanup(function() {
			removeLoadHandler();
			removeResetHandler();
			refs.remove(name);
		});
	}
	
	if (typeof assetName === "function") {
		if (typeof assetName.effect === "function") {
			assetName.effect(setAssetName);
		} else {
			effect(function() {
				setAssetName(assetName(), onUnmount);
			});
		}
	} else {
		setAssetName(assetName, onUnmount);
	}
	
	return state.map();
}

$.assetState = createAssetState;

})($);
