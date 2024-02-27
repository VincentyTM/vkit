var currentInjector = null;

export function getInjector(allowNull) {
	if (!allowNull && !currentInjector) {
		throw new Error("This function can only be called synchronously from a component");
	}
	return currentInjector;
}

export function setInjector(injector) {
	currentInjector = injector;
}
