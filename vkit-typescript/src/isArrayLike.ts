export function isArrayLike(value: any): value is ArrayLike<unknown> {
	return !!(value && typeof value.length === "number");
}
