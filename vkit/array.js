(function($){

var useKey = $.useKey;
var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

function useArray(signal){
	return {
		add: function(value){
			var array = signal.get();
			
			for(var i=array.length; i--;){
				if( array[i] === value ){
					return;
				}
			}
			
			signal.set(array.concat([value]));
		},
		
		effect: signal.effect,
		
		get: signal.get,
		
		pop: function(){
			var array = signal.get();
			var n = array.length - 1;
			
			signal.set(array.slice(0, n));
			
			return array[n];
		},
		
		push: function(){
			var newArray = signal.get().concat(slice.call(arguments));
			
			signal.set(newArray);
			
			return newArray.length;
		},
		
		remove: function(value){
			var array = signal.get();
			
			for(var i=array.length; i--;){
				if( array[i] === value ){
					signal.set(array.slice(0, i).concat(array.slice(i + 1)));
					return;
				}
			}
		},
		
		reverse: function(){
			signal.set(signal.get().slice().reverse());
		},
		
		set: signal.set,
		
		shift: function(){
			var array = signal.get();
			
			signal.set(array.slice(1));
			
			return array[0];
		},
		
		sort: function(compare){
			signal.set(signal.get().slice().sort(compare));
		},
		
		splice: function(start, length){
			var array = signal.get();
			
			signal.set(
				array.slice(0, start).concat(
					slice.call(arguments, 2),
					array.slice(start + length)
				)
			);
			
			return array.slice(start, length);
		},
		
		subscribe: signal.subscribe,
		
		unshift: function(){
			var newArray = concat.call(slice.call(arguments), signal.get());
			
			signal.set(newArray);
			
			return newArray.length;
		},
		
		useKey: function(getKey, transformValue){
			return useKey(signal, getKey, transformValue);
		},
		
		views: function(getView){
			return signal.views(getView);
		}
	};
}

$.array = useArray;

})($);
