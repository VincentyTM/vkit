function toArray<ValueType>(arrayLike: ArrayLike<ValueType>){
	var n = arrayLike.length;
	var a = new Array<ValueType>(n);
	
	for(var i=0; i<n; ++i){
		a[i] = arrayLike[i];
	}
	
	return a;
}

export default toArray;
