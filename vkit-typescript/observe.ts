import observable, { Observable } from "./observable";

function observe<ObjectType>(object: ObjectType, property: keyof ObjectType){
	var desc = Object.getOwnPropertyDescriptor(object, property);
	
	if(!desc){
		return null;
	}
	
	if( desc.get && (desc.get as any).emitChange ){
		return (desc.get as any).emitChange as Observable<ObjectType[keyof ObjectType]>;
	}
	
	var value = object[property];
	
	function get(){
		return value;
	}
	
	var emitChange = get.emitChange = observable<ObjectType[keyof ObjectType]>();
	
	Object.defineProperty(object, property, {
		get: get,
		set: function(v){
			if( value !== v ){
				value = v;
				emitChange(v);
			}
		}
	});
	
	return emitChange;
}

export default observe;
