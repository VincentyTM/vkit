import registry from "./customElementRegistry.js";

export default function customElement(name, getView, options) {
	if (name in registry) {
		throw new Error("'" + name + "' has already been defined as a custom element");
	}
	
	if (!/[a-z]+-[a-z\-]*/.test(name)) {
		throw new Error("'" + name + "' is not a valid custom element name");
	}
	
	registry[name] = {
		getView: getView,
		observedAttributes: options && options.observedAttributes || []
	};
	
	return getView;
}
