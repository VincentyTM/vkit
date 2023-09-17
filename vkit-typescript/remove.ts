export default function remove(node: Node): void {
	var parent = node.parentNode;
	if (parent) {
		parent.removeChild(node);
	}
}
