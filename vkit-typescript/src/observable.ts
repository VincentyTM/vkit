export type Observable<T> = {
	(value: T): void;
	clear(): void;
	count(): number;
	has(callback: (value: T) => void): boolean;
	subscribe(callback: (value: T) => void): () => void;
};

export default function createObservable<T>(): Observable<T> {
	var callbacks: ((value: T) => void)[] = [];
	var n = 0;
	
	function observable(value: T): void {
		for (var i = 0; i < n; i += 2) {
			callbacks[i](value);
		}
	}
	
	function subscribe(callback: (value: T) => void): () => void {
		if (typeof callback !== "function") {
			throw new Error("Callback is not a function");
		}
		
		function unsubscribe(): void {
			for (var i = Math.min(curr, n) - 1; i > 0; i -= 2) {
				if (callbacks[i] === unsubscribe) {
					callbacks.splice(i - 1, 2);
					n -= 2;
					break;
				}
			}
		}
		
		var curr = n = callbacks.push(callback, unsubscribe);
		return unsubscribe;
	}
	
	function getCount(): number {
		return n / 2;
	}
	
	function clear(): void {
		if (n > 0) {
			callbacks.splice(0, n);
			n = 0;
		}
	}
	
	function has(callback: (value: T) => void): boolean {
		for (var i = n - 2; i >= 0; i -= 2) {
			if (callbacks[i] === callback) {
				return true;
			}
		}
		return false;
	}
	
	observable.subscribe = subscribe;
	observable.count = getCount;
	observable.clear = clear;
	observable.has = has;
	
	return observable as Observable<T>;
}
