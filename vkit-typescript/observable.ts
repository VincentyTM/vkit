type Observable<ValueType> = {
	(value: ValueType): void,
	clear(): void,
	count(): number,
	has(callback: (value: ValueType) => void): boolean,
	subscribe(callback: (value: ValueType) => void): () => void
};

function createObservable<ValueType>(){
	var callbacks: ((value: ValueType) => void)[] = [], n = 0;
	
	function observable(value: ValueType){
		for(var i = 0; i < n; i += 2){
			callbacks[i](value);
		}
	}
	
	function subscribe(callback: (value: ValueType) => void){
		if( typeof callback !== "function" ){
			throw new Error("Callback is not a function");
		}
		
		function unsubscribe(){
			for(var i = Math.min(curr, n) - 1; i > 0; i -= 2){
				if( callbacks[i] === unsubscribe ){
					callbacks.splice(i - 1, 2);
					n -= 2;
					break;
				}
			}
		}
		
		var curr = n = callbacks.push(callback, unsubscribe);
		
		return unsubscribe;
	}
	
	function getCount(){
		return n / 2;
	}
	
	function clear(){
		if( n > 0 ){
			callbacks.splice(0, n);
			n = 0;
		}
	}
	
	function has(callback: (value: ValueType) => void){
		for(var i = n - 2; i >= 0; i -= 2){
			if( callbacks[i] === callback ){
				return true;
			}
		}
		
		return false;
	}
	
	observable.subscribe = subscribe;
	observable.count = getCount;
	observable.clear = clear;
	observable.has = has;
	
	return observable as Observable<ValueType>;
}

export type {Observable};

export default createObservable;
