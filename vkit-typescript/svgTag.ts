import append from "./append";
import bind from "./bind";
import effect from "./effect";
import onEvent, {EventTargetType} from "./onEvent";
import {Signal} from "./signal";
import {View} from "./view";

type AttributeValue = string | null;
type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

var xmlns = "http://www.w3.org/2000/svg";

function setAttribute(el: Element, name: string, value: string | null) {
	if (value === null) {
		el.removeAttributeNS(null, name);
	} else {
		el.setAttributeNS(null, name, value);
	}
}

function bindAttribute(el: Element, name: string, value: ReactiveAttributeValue) {
	if (typeof value === "function") {
		if ((value as Signal<AttributeValue>).effect) {
			(value as Signal<AttributeValue>).effect(function(v) {
				setAttribute(el, name, v);
			});
		} else if (name.indexOf("on") === 0) {
			onEvent(el as unknown as EventTargetType, name.substring(2), value);
		} else {
			effect(function() {
				setAttribute(el, name, (value as () => AttributeValue)());
			});
		}
	} else if (value && typeof value === "object") {
		bind((el as any)[name], value);
	} else {
		setAttribute(el, name, value);
	}
}

function bindAttributes(el: Element, attributes: {[attributeName: string]: ReactiveAttributeValue}) {
	for (var name in attributes) {
		bindAttribute(el, name, attributes[name]);
	}
}

function svgTag(tagName: string) {
	return function() {
		var el = document.createElementNS(xmlns, tagName);
		append<View, Element>(el, arguments, el, bindAttributes);
		return el;
	};
}

export default svgTag;
