import observable, {type Observable} from "./observable.js";

var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

export default function observe<ObjectType>(
	object: ObjectType,
	property: keyof ObjectType
): Observable<ObjectType[keyof ObjectType]> | null {
	var desc = getOwnPropertyDescriptor(object, property);
	
	if (!desc) {
		return null;
	}
	
	if (desc.get && (desc.get as any).emitChange) {
		return (desc.get as any).emitChange as Observable<ObjectType[keyof ObjectType]>;
	}
	
	var value = object[property];
	
	function get(): ObjectType[keyof ObjectType] {
		return value;
	}
	
	var emitChange = get.emitChange = observable<ObjectType[keyof ObjectType]>();
	
	defineProperty(object, property, {
		get: get,
		set: function(v: ObjectType[keyof ObjectType]): void {
			if (value !== v) {
				value = v;
				emitChange(v);
			}
		}
	});
	
	return emitChange;
}
