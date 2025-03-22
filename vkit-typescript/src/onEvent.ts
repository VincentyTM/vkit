import { update } from "./update.js";

export type EventListenerType = (this: unknown, event: EventType) => unknown;

export type EventTargetType = {
	addEventListener: (type: string, listener: EventListenerType, options?: boolean | AddEventListenerOptions | undefined) => void;
	removeEventListener: (type: string, listener: EventListenerType, options?: boolean | AddEventListenerOptions | undefined) => void;
	attachEvent?: (type: string, listener: EventListenerType) => void;
	detachEvent?: (type: string, listener: EventListenerType) => void;
};

type EventType = {
	returnValue?: boolean;
	cancelBubble?: boolean;
	currentTarget?: EventTargetType;
	preventDefault?: () => void;
	stopPropagation?: () => void;
};

function preventDefault(this: EventType): void {
	this.returnValue = false;
}

function stopPropagation(this: EventType): void {
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
export function onEvent(
	target: EventTargetType,
	type: string,
	listener: EventListenerType
): () => void {
	function eventListener(e: EventType): ReturnType<EventListenerType> {
		if (!e.preventDefault) {
			e.preventDefault = preventDefault;
		}
		
		if (!e.stopPropagation) {
			e.stopPropagation = stopPropagation;
		}

		if (!e.currentTarget) {
			e.currentTarget = target;
		}
		
		var ret = listener.call(target, e);
		
		if (ret && typeof (ret as Promise<unknown>).then === "function") {
			(ret as Promise<unknown>).then(update);
		}
		
		update();
		return ret;
	}
	
	if (target.addEventListener) {
		target.addEventListener(type, eventListener, false);
		
		return function(): void {
			target.removeEventListener!(type, eventListener, false);
		};
	} else if (target.attachEvent) {
		type = "on" + type;
		target.attachEvent(type, eventListener);
		
		return function(): void {
			target.detachEvent!(type, eventListener);
		};
	}
	
	throw new Error("Event listener could not be attached.");
}
