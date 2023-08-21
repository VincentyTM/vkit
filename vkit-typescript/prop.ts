import effect from "./effect";

function prop<ElementType, ValueType>(
	name: string,
	getValue: () => ValueType
){
	return function(element: ElementType){
		effect(function(){
			(element as any)[name] = getValue();
		});
	};
}

export default prop;
