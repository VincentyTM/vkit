import update from "./update";

type EventListenerType = {
    call: (target: EventTargetType, event: EventType) => any;
};

type EventTargetType = {
    addEventListener?: (eventType: string, eventListener: EventListenerType, capturing: boolean) => void;
    removeEventListener?: (eventType: string, eventListener: EventListenerType, capturing: boolean) => void;
    attachEvent?: (eventType: string, eventListener: EventListenerType) => void;
    detachEvent?: (eventType: string, eventListener: EventListenerType) => void;
};

type EventType = {
    returnValue?: boolean;
    cancelBubble?: boolean;
    preventDefault?: () => void;
    stopPropagation?: () => void;
};

function preventDefault(this: EventType){
	this.returnValue = false;
}

function stopPropagation(this: EventType){
	this.cancelBubble = true;
}

function onEvent(
	target: EventTargetType,
	type: string,
	listener: EventListenerType
){
	function eventListener(e: EventType){
		if(!e.preventDefault){
			e.preventDefault = preventDefault;
		}
		
		if(!e.stopPropagation){
			e.stopPropagation = stopPropagation;
		}
		
		var ret = listener.call(target, e);
		
		if( ret && typeof ret.then === "function" ){
			ret.then(update);
		}
		
		update();
		
		return ret;
	}
	
	if( target.addEventListener ){
		target.addEventListener(type, eventListener, false);
		
		return function(){
			target.removeEventListener!(type, eventListener, false);
		};
	}else if( target.attachEvent ){
		type = "on" + type;
		target.attachEvent(type, eventListener);
		
		return function(){
			target.detachEvent!(type, eventListener);
		};
	}
	
	throw new Error("Event listener could not be attached.");
}

export type {EventListenerType};

export default onEvent;
