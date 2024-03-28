var map = typeof WeakMap === "function" ? new WeakMap<any, any>() : {
	get: function(object: any) {
		return object.__hashCode;
	},
	
	set: function(object: any, value: any) {
		object.__hashCode = value;
	}
};

var objectCount = 0;

function next<T>(value: T): any {
	var key = map.get(value);
	
	if (key) {
		return key;
	}
	
	key = ++objectCount;
	map.set(value, key);
	
	return key;
}

export default function hashCode<T>(value: T): string {
	switch (typeof value) {
		case "object":
			return value === null ? String(value) : "o" + next<T>(value);
		case "string":
			return "s" + value;
		case "number":
		case "boolean":
		case "undefined":
		case "symbol":
			return String(value);
		case "function":
			return "f" + next<T>(value);
		case "bigint":
			return value + "n";
		default:
			return "";
	}
}
