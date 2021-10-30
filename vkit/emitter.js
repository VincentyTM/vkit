(function($){

function createEmitter(){
	var dataChannel = $.observable();
	var errorChannel = $.observable();
	
	function subscribe(child, onData, onError){
		function forwardData(data){ child.emit(data); }
		function forwardError(error){ child.throwError(error); }
		
		var unsubscribeData = dataChannel.subscribe(onData || forwardData);
		var unsubscribeError = errorChannel.subscribe(onError || forwardError);
		
		function unsubscribe(){
			unsubscribeData();
			unsubscribeError();
		}
		
		child.unsubscribe = unsubscribe;
		
		return child;
	}
	
	function map(transform){
		var child = createEmitter();
		function onData(data){
			try{
				child.emit(transform ? transform(data) : data);
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}
	
	function tap(observe){
		var child = createEmitter();
		function onData(data){
			try{
				observe(data);
				child.emit(data);
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}
	
	function awaitMap(transform){
		var child = createEmitter();
		function onData(data){
			try{
				var value = transform ? transform(data) : data;
				if( value && typeof value.then === "function" ){
					value.then(child.emit, child.throwError);
				}else{
					child.emit(value);
				}
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}
	
	function asyncMap(callback){
		var child = createEmitter();
		function onData(data){
			try{
				callback(data, child.emit, child.throwError);
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}
	
	function input(transform){
		var child = map(transform);
		$. unmount(child.unsubscribe);
		return child;
	}
	
	function when(condition){
		var child = createEmitter();
		function onData(data){
			try{
				if( condition(data) ){
					child.emit(data);
				}
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}
	
	function then(onData, onError){
		return subscribe(createEmitter(), onData, onError);
	}
	
	function catchError(onError){
		return subscribe(createEmitter(), null, onError);
	}
	
	function createState(init){
		var state = $.state(init);
		pipe(state);
		return state;
	}
	
	function pipe(state){
		function onData(data){
			state.set(data);
			$.render();
		}
		state.unsubscribe = dataChannel.subscribe(onData);
		return emitter;
	}
	
	var emitter = {
		emit: dataChannel,
		throwError: errorChannel,
		map: map,
		tap: tap,
		await: awaitMap,
		async: asyncMap,
		input: input,
		when: when,
		then: then,
		catchError: catchError,
		state: createState,
		pipe: pipe
	};
	
	return emitter;
}

$.emitter = createEmitter;

})($);
