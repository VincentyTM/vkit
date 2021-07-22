class RouterService {
	constructor(){
		this.router = $.router();
		
		window.addEventListener("hashchange", this.onHashChange = () => $.render());
	}
	destructor(){
		window.removeEventListener("hashchange", this.onHashChange);
	}
}
