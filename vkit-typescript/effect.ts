import component from "./component";

function effect(callback: () => void){
	component(callback).render();
}

export default effect;
