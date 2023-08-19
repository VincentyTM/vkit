(function($){

var createSignal = $.signal;
var update = $.update;

var delay = typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback){ Promise.resolve().then(callback); }
	: function(callback){ setTimeout(callback, 0); };

function makeThenable(signal){
	signal.error = mapError;
	signal.pending = mapPending;
	signal.status = mapStatus;
	signal.then = then;
	signal.value = mapValue;
	
	return signal;
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
	var newSignal = createSignal({pending: true});
	
	function updateValue(result){
		if( result.fulfilled ){
			unsubscribe();
			
			if( typeof onResolve === "function" ){
				var value = result.value;
				
				delay(function(){
					try{
						var ret = onResolve(value);
						
						if( ret && typeof ret.then === "function" ){
							ret.then(function(val){
								newSignal.set({fulfilled: true, value: val});
								update();
							}, function(error){
								newSignal.set({rejected: true, error: error});
								update();
							});
						}else{
							newSignal.set({fulfilled: true, value: ret});
						}
					}catch(error){
						newSignal.set({rejected: true, error: error});
					}finally{
						update();
					}
				});
			}
		}else if( result.rejected ){
			unsubscribe();
			
			if( typeof onReject === "function" ){
				var error = result.error;
				
				delay(function(){
					try{
						newSignal.set(result);
						onReject(error);
					}finally{
						update();
					}
				});
			}
		}else if(!result.pending){
			unsubscribe();
			newSignal.set({});
		}
	}
	
	var unsubscribe = this.subscribe(updateValue);
	
	updateValue(this.get());
	
	return makeThenable(newSignal.map());
}

$.thenable = makeThenable;

})($);
