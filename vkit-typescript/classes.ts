import effect from "./effect";
import isArray from "./isArray";
import onUnmount from "./onUnmount";
import {Signal} from "./signal";

type BooleanValue = boolean | Signal<boolean> | (() => boolean);
type ClassArgument = (
	string |
	NoClass |
	Signal<string | NoClass> |
	(() => string | NoClass) |
	ArrayLike<ClassArgument> |
	{[className: string]: BooleanValue}
);
type CleanupFunction = (callback: () => void) => void;
type NoClass = null | undefined | boolean;

function addClass(el: HTMLElement, name: string){
	if( el.classList ){
		el.classList.add(name);
	}else{
		el.className += " " + name;
	}
}

function removeClass(el: HTMLElement, name: string){
	if( el.classList ){
		el.classList.remove(name);
	}else{
		el.className = el.className.replace(" " + name, "");
	}
}

function bindClass(el: HTMLElement, name: string, value: BooleanValue){
	if( value && typeof (value as Signal<boolean>).effect === "function" ){
		(value as Signal<boolean>).effect(function(v){
			v ? addClass(el, name) : removeClass(el, name);
		});
	}else if( value === true ){
		addClass(el, name);
	}else if( value === false ){
		removeClass(el, name);
	}else if( typeof value === "function" ){
		effect(function(){
			bindClass(el, name, value());
		});
	}
}

function bindClasses(el: HTMLElement, arg: ClassArgument, onCleanup?: CleanupFunction){
	var type = typeof arg;
	
	if (!arg) {
	} else if (isArray(arg)) {
		var n = arg.length;
		
		for (var i = 0; i < n; ++i) {
			bindClasses(el, arg[i], onCleanup);
		}
	} else if (type === "string") {
		addClass(el, arg as string);
		
		if (onCleanup) {
			onCleanup(function() {
				removeClass(el, arg as string);
			});
		}
	} else if (typeof (arg as Signal<ClassArgument>).effect === "function") {
		(arg as Signal<ClassArgument>).effect(function(value: ClassArgument, onCleanup?: CleanupFunction) {
			bindClasses(el, value, onCleanup);
		});
	} else if (type === "object") {
		for (var name in arg as {[className: string]: BooleanValue}) {
			bindClass(el, name, (arg as {[className: string]: BooleanValue})[name]);
		}
	} else if (type === "function") {
		effect(function() {
			bindClasses(el, (arg as () => ClassArgument)(), onUnmount);
		});
	}
}

function classes(...args: ClassArgument[]): (element: HTMLElement) => void;
function classes() {
	var args = arguments;
	var n = args.length;
	
	return function(element: HTMLElement) {
		for (var i = 0; i < n; ++i) {
			bindClasses(element, args[i]);
		}
	};
}

export default classes;
