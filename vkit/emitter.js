(function($){

var getComponent = $.getComponent;
var createObservable = $.observable;
var createState = $.state;
var unmount = $.unmount;
var render = $.render;

function createEmitter(base){
	var component = getComponent(true);
	var dataChannel = createObservable();
	var errorChannel = createObservable();

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
		
		var currentComponent = getComponent(true);
		if( component !== currentComponent ){
			if(!currentComponent){
				throw new Error("Source emitter is created in a component, but not the destination");
			}
			unmount(unsubscribe);
		}
		
		return child;
	}

	function map(){
		var child = createEmitter(base);
		var args = arguments, n = args.length;
		function onData(data){
			try{
				for(var i=0; i<n; ++i){
					data = args[i](data);
				}
				child.emit(data);
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}

	function tap(observe){
		var child = createEmitter(base);
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
		var child = createEmitter(base);
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
		var child = createEmitter(base);
		function onData(data){
			try{
				callback(data, child.emit, child.throwError);
			}catch(ex){
				child.throwError(ex);
			}
		}
		return subscribe(child, onData);
	}

	function when(condition){
		var child = createEmitter(base);
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
		return subscribe(createEmitter(base), onData, onError);
	}

	function catchError(onError){
		return subscribe(createEmitter(base), null, onError);
	}

	function createStateFrom(init){
		var state = createState(init);
		pipe(state);
		return state;
	}

	function pipe(state, transform){
		function onData(data){
			if( transform ){
				data = transform(data);
			}
			state.set(data);
			render();
		}
		state.unsubscribe = dataChannel.subscribe(onData);
		return e;
	}

	var e;

	if( base ){
		function Emitter(){}
		Emitter.prototype = base;
		e = new Emitter();
	}else{
		e = {};
	}

	e.emit = dataChannel;
	e.throwError = errorChannel;
	e.map = map;
	e.tap = tap;
	e.await = awaitMap;
	e.async = asyncMap;
	e.when = when;
	e.then = then;
	e.catchError = catchError;
	e.state = createStateFrom;
	e.pipe = pipe;

	return e;
}

$.emitter = createEmitter;

})($);
