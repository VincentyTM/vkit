var emptyComponent = function() {
	return null;
};

export default function preload(promise, pendingComponent, errorComponent) {
	return pendingComponent || emptyComponent;
}
