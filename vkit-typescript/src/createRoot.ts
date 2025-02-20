import { empty } from "./empty.js";
import { noop } from "./noop.js";
import { renderDetached } from "./renderDetached.js";
import type { View } from "./view.js";

export type AppRoot<C> = {
    /**
     * Replaces the container element's value with the new root component.
     * Before that, it unmounts the previous root component and clears the container.
     * @param rootComponent 
     */
    render(rootComponent: () => View<C>): void;

    /**
     * Unmounts the previous root component.
     */
    unmount(): void;
};

/**
 * Creates an application root whose root component can be manually unmounted or replaced.
 * It is useful if the application can be destroyed from the outside (e.g. by a window unload event or another framework on the same page).
 * If that is not the case, consider using the `render` method instead.
 * @example
 * // Create the application and destroy it after 1 second
 * const root = createRoot(document.body);
 * root.render(App);
 * setTimeout(() => root.unmount(), 1000);
 * 
 * @param container A DOM element that contains the application.
 * @returns An object that can be used for rendering and unmounting the component tree.
 */
export function createRoot<C extends Element>(container: C): AppRoot<C> {
    var unmount: () => void = noop;

    return {
        render: function(rootComponent: () => View<C>): void {
            unmount();
            empty(container);
            unmount = renderDetached(rootComponent, container);
        },

        unmount: function(): void {
            unmount();
            unmount = noop;
        }
    };
}
