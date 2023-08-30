function isSignal(value: any){
	return !!(value && typeof value.effect === "function" && typeof value.get === "function");
}

export default isSignal;
