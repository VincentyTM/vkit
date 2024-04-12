import observable, {type Observable} from "./observable.js";

var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

export default function observe<T, K extends keyof T>(object: T, property: K): Observable<T[K]> | null {
	var desc = getOwnPropertyDescriptor(object, property);
	
	if (!desc) {
		return null;
	}
	
	if (desc.get && (desc.get as any).emitChange) {
		return (desc.get as any).emitChange as Observable<T[K]>;
	}
	
	var value = object[property];
	
	function get(): T[K] {
		return value;
	}
	
	var emitChange = get.emitChange = observable<T[K]>();
	
	defineProperty(object, property, {
		get: get,
		set: function(v: T[K]): void {
			if (value !== v) {
				value = v;
				emitChange(v);
			}
		}
	});
	
	return emitChange;
}
