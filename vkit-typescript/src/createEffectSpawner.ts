import { getEffect } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { updateEffect } from "./updateEffect.js";

interface EffectSpawner<T> {
	spawn(data: T): void;
}

/**
 * Creates an effect spawner.
 * The spawner can be used to create effects within the current reactive context.
 * When the context is destroyed, so are all the dynamically created effects.
 * @example
 * const spawner = createEffectSpawner((destroy, conn) => {
 * 	console.log("Connected. Effect created.");
 * 
 * 	conn.on("close", destroy);
 * 
 * 	onDestroy(() => {
 * 		console.log("Disconnected. Effect destroyed.");
 * 
 * 		conn.removeListener("close", destroy);
 * 	});
 * });
 * 
 * startServer({
 * 	onConnect(conn) {
 * 		spawner.spawn(conn); // conn is a connection object
 * 	}
 * });
 * 
 * @param onCreate A callback called within a reactive subcontext.
 * Its two parameters are a destroy function and the passed data.
 * @returns An effect spawner object.
 */
export function createEffectSpawner<T>(
	onCreate: (destroy: () => void, data: T) => void
): EffectSpawner<T> {
	var parentEffect = getEffect();
	
	return {
		spawn: function(data: T): void {
			var childEffect = createEffect(parentEffect, parentEffect.injector, function(): void {
				onCreate(destroy, data);
			});
			updateEffect(childEffect);
			
			function destroy(): void {
				destroyEffect(childEffect);
			}
		}
	};
}
