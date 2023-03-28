(function($){

var createState = $.state;
var render = $.render;

var delay = typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback){ Promise.resolve().then(callback); }
	: function(callback){ setTimeout(callback, 0); };

function makeThenable(state){
	state.error = mapError;
	state.pending = mapPending;
	state.status = mapStatus;
	state.then = then;
	state.value = mapValue;
	return state;
}

function mapStatus(){
	return this.map(getStatus);
}

function mapError(){
	return this.map(getError);
}

function mapPending(){
	return this.map(getPending);
}

function mapValue(){
	return this.map(getValue);
}

function getStatus(result){
	return (
		result.fulfilled ? "fulfilled" :
		result.rejected ? "rejected" :
		result.pending ? "pending" :
		"default"
	);
}

function getError(result){
	return result.error;
}

function getPending(result){
	return !!result.pending;
}

function getValue(result){
	return result.value;
}

function then(onResolve, onReject){
	var newState = createState({pending: true});
	
	function update(result){
		if( result.fulfilled ){
			unsubscribe();
			if( typeof onResolve === "function" ){
				var value = result.value;
				delay(function(){
					try{
						var ret = onResolve(value);
						if( ret && typeof ret.then === "function" ){
							ret.then(function(val){
								newState.set({fulfilled: true, value: val});
								render();
							}, function(error){
								newState.set({rejected: true, error: error});
								render();
							});
						}else{
							newState.set({fulfilled: true, value: ret});
						}
					}catch(error){
						newState.set({rejected: true, error: error});
					}finally{
						render();
					}
				});
			}
		}else if( result.rejected ){
			unsubscribe();
			if( typeof onReject === "function" ){
				var error = result.error;
				delay(function(){
					try{
						newState.set(result);
						onReject(error);
					}finally{
						render();
					}
				});
			}
		}else if(!result.pending){
			unsubscribe();
			newState.set({});
		}
	}
	
	var unsubscribe = this.onChange.subscribe(update);
	update(this.get());
	return makeThenable(newState.map());
}

$.thenable = makeThenable;

})($);
