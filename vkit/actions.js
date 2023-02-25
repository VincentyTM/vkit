(function($, undefined){

function patchMethod(state, reducer){
	return function(){
		var value = reducer.apply(state.get(), arguments);
		if( value !== undefined ){
			state.set(value);
		}
	};
}

function createActions(state, reducers, actions){
	if(!actions) actions = {};
	if( reducers ){
		for(var name in reducers){
			actions[name] = patchMethod(state, reducers[name]);
		}
	}
	return actions;
}

$.actions = createActions;

})($);
