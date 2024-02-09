export default function isSignal(value: any): boolean {
	return !!(value && value.isSignal === true);
}
