var currentInjector = null;

function getInjector(allowNull) {
	if (!allowNull && !currentInjector) {
		throw new Error("This function can only be called synchronously from a component");
	}
	return currentInjector;
}

function setInjector(injector) {
	currentInjector = injector;
}

module.exports = {
	getInjector: getInjector,
	setInjector: setInjector
};
