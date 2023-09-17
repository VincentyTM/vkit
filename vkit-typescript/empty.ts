export default function empty(parent: HTMLElement): void {
	if (parent.replaceChildren) {
		parent.replaceChildren();
	} else {
		var child: Node | null = null;
		
		while (child = parent.lastChild) {
			parent.removeChild(child);
		}
	}
}
