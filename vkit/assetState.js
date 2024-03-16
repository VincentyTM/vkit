(function($) {

var effect = $.effect;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;

function createAssetState(refs, assetName, defaultValue) {
	var state = signal();
	
	function setAssetName(name) {
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
		
		onUnmount(function() {
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
				setAssetName(assetName());
			});
		}
	} else {
		setAssetName(assetName);
	}
	
	return readOnly(state);
}

$.assetState = createAssetState;

})($);
