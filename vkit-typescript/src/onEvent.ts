export type EventListenerType<E extends Event> = (this: unknown, event: E) => unknown;

interface EventTargetType<E extends Event> {
	addEventListener: (type: string, listener: EventListenerType<E>, options?: boolean | AddEventListenerOptions | undefined) => void;
	removeEventListener: (type: string, listener: EventListenerType<E>, options?: boolean | AddEventListenerOptions | undefined) => void;
	attachEvent?: (type: string, listener: EventListenerType<E>) => void;
	detachEvent?: (type: string, listener: EventListenerType<E>) => void;
}

type EventType<K> = K extends keyof GlobalEventHandlersEventMap ? GlobalEventHandlersEventMap[K] : Event;

function preventDefault(this: Event): void {
	(this as any).returnValue = false;
}

function stopPropagation(this: Event): void {
	this.cancelBubble = true;
}

/**
 * Attaches an event listener to an event target.
 * It is patched so that there is always an update after the event listener runs.
 * @example
 * // This will remove the event listener when the current component unmounts
 * onDestroy(
 * 	onEvent(document, "click", () => console.log("Clicked!"))
 * );
 * 
 * @param target The event target.
 * @param type The type of the handled event.
 * @param listener The event listener function.
 * @returns A function that removes the event listener from the event target.
 */
export function onEvent<K extends string>(
	target: EventTargetType<EventType<K>>,
	type: K,
	listener: EventListenerType<EventType<K>>
): () => void {
	function eventListener(e: EventType<K>): ReturnType<EventListenerType<EventType<K>>> {
		if (!e.preventDefault) {
			e.preventDefault = preventDefault;
		}
		
		if (!e.stopPropagation) {
			e.stopPropagation = stopPropagation;
		}

		if (!e.currentTarget) {
			(e as any).currentTarget = target;
		}
		
		return listener.call(target, e);
	}
	
	if (target.addEventListener) {
		target.addEventListener(type, eventListener, false);
		
		return function(): void {
			target.removeEventListener!(type, eventListener, false);
		};
	} else if (target.attachEvent) {
		var extendedType = "on" + type;
		target.attachEvent(extendedType, eventListener);
		
		return function(): void {
			target.detachEvent!(extendedType, eventListener);
		};
	}
	
	throw new Error("Event listener could not be attached.");
}
