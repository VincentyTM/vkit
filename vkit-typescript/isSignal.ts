export default function isSignal(value: any): boolean {
	return !!(value && typeof value.effect === "function" && typeof value.get === "function");
}
