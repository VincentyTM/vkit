var objectAssign: <T>(a: Partial<T>, b: T) => T = Object.assign || function<T>(a: Partial<T>, b: T): T {
	for (var k in b) {
		a[k] = b[k];
	}
	
	return a as T;
};

export default objectAssign;
