import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";

function mount(): void {
	throw new Error("The root effect cannot be updated");
}

export var rootInjector = createInjector(undefined, true);

export var rootEffect = createEffect(undefined, rootInjector, mount);
