import component from "./component";

export default function effect(callback: () => void): void {
	component(callback).render();
}
