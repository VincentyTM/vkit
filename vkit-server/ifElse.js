export default function ifElse() {
	var n = arguments.length - 1;
	
	for (var i = 0; i < n; i += 2) {
		if (arguments[i]()) {
			return arguments[i + 1]();
		}
	}
	
	return n & 1 ? null : arguments[n]();
}
