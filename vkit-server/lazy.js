export default function lazy(promise, pendingComponent, errorComponent) {
	if (typeof pendingComponent === "function") {
		return pendingComponent();
	}
	
	return pendingComponent || null;
}
