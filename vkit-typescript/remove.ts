function remove(node: Node){
	var parent = node.parentNode;
	
	if( parent ){
		parent.removeChild(node);
	}
}

export default remove;
