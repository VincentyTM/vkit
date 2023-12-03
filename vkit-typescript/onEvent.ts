import update from "./update";

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
	preventDefault?: () => void;
	stopPropagation?: () => void;
};

function preventDefault(this: EventType) {
	this.returnValue = false;
}

function stopPropagation(this: EventType) {
	this.cancelBubble = true;
}

export default function onEvent(
	target: EventTargetType,
	type: string,
	listener: EventListenerType
) {
	function eventListener(e: EventType) {
		if (!e.preventDefault) {
			e.preventDefault = preventDefault;
		}
		
		if (!e.stopPropagation) {
			e.stopPropagation = stopPropagation;
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
		
		return function() {
			target.removeEventListener!(type, eventListener, false);
		};
	} else if (target.attachEvent) {
		type = "on" + type;
		target.attachEvent(type, eventListener);
		
		return function() {
			target.detachEvent!(type, eventListener);
		};
	}
	
	throw new Error("Event listener could not be attached.");
}
