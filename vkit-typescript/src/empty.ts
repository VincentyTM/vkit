export function empty(container: Element): void {
	if (container.replaceChildren) {
		container.replaceChildren();
	} else {
		var child: Node | null = null;
		
		while (child = container.lastChild) {
			container.removeChild(child);
		}
	}
}
