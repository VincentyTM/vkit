function empty(parent: HTMLElement){
	if( parent.replaceChildren ){
		parent.replaceChildren();
	}else{
		var child: Node | null = null;
		
		while( child = parent.lastChild ){
			parent.removeChild(child);
		}
	}
}

export default empty;
