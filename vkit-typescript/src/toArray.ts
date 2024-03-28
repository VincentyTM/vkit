export default function toArray<T>(arrayLike: ArrayLike<T>): T[] {
	var n = arrayLike.length;
	var a = new Array<T>(n);
	
	for (var i = 0; i < n; ++i) {
		a[i] = arrayLike[i];
	}
	
	return a;
}
