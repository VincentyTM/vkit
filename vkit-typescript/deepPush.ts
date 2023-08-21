import toArray from "./toArray";

function deepPush<ItemType, ContextType>(
	array: {
		push(value: ItemType | Node): number | void;
	},
	item: ItemType,
	context: ContextType,
	bind?: (
		target: ContextType,
		modifier: ItemType,
		isExternal?: boolean
	) => void
){
	if( item === null || item === undefined || typeof item === "boolean" ){
	}else if( typeof (item as any).render === "function" ){
		deepPush(array, (item as any).render(), context, bind);
	}else if( typeof item !== "object" ){
		if( typeof item === "function" ){
			item(context);
		}else{
			array.push(document.createTextNode(item as any));
		}
	}else if( (item as any).nodeType ){
		array.push(item);
	}else if( typeof (item as any).length === "number" ){
		var n = (item as any).length;
		var a = toArray<any>(item as any);
		for(var i=0; i<n; ++i){
			deepPush(array, a[i], context, bind);
		}
	}else if( typeof (item as any).next === "function" ){
		var x;
		do{
			x = (item as any).next();
			deepPush(array, x.value, context, bind);
		}while(!x.done);
	}else if( bind ){
		bind(context, item, true);
	}
	return array;
}

export default deepPush;
