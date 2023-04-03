(function($){

var createState = $.state;
var unmount = $.unmount;

function createAssetState(refs, assetName, defaultValue){
	var state = createState();
	
	function setAssetName(name, cleanup){
		if(!name && name !== ""){
			state.set(defaultValue);
			return;
		}
		
		var asset = refs.add(name);
		state.set(asset.isFulfilled() ? asset.get() : defaultValue);
		
		var removeLoadHandler = asset.onLoad(function(value){
			state.set(value);
		});
		
		var removeResetHandler = asset.onReset(function(){
			state.set(defaultValue);
		});
		
		cleanup(function(){
			removeLoadHandler();
			removeResetHandler();
			refs.remove(name);
		});
	}
	
	if( assetName && typeof assetName.effect === "function" ){
		assetName.effect(setAssetName);
	}else{
		setAssetName(assetName, unmount);
	}
	
	return state.map();
}

$.assetState = createAssetState;

})($);
