(function($, undefined){

var group = $.group;
var append = $.append;
var render = $.render;
var setProps = $.setProps;
var createState = $.state;

function setPrototypeOf(obj, proto){
	if( Object.setPrototypeOf ){
		Object.setPrototypeOf(obj, proto);
	}else{
		obj.__proto__ = proto;
	}
}

function createCustomElement(name, component, options){
	function CustomElement(){
		var el = Reflect.construct(HTMLElement, [], CustomElement);
		var attrs = {};
		el.data = {attributes: attrs};

		function attr(name){
			if( name === undefined ){
				return new Proxy({}, {
					get: getAttr
				});
			}

			function onAttrChange(value){
				el.setAttribute(name, value);
			}

			if(!(name in attrs)){
				var state = createState(el.getAttribute(name));
				state.onChange.subscribe(onAttrChange);
				attrs[name] = state;
				if( CustomElement.observedAttributes.indexOf(name) === -1 ){
					CustomElement.observedAttributes.push(name);
				}
			}
			return attrs[name];
		}

		function getAttr(target, prop, receiver){
			return attr(prop);
		}

		var view = component.call(el, {
			element: el,
			children: el.childNodes,
			attr: attr
		});
		append(el, view, el, setProps);
		return el;
	}

	setPrototypeOf(CustomElement.prototype, HTMLElement.prototype);
	setPrototypeOf(CustomElement, HTMLElement);

	function onAttr(name, oldValue, newValue){
		var attr = this.data.attributes[name];
		if( attr ){
			attr.set(newValue);
			render();
		}
	}

	CustomElement.observedAttributes = [];

	var proto = CustomElement.prototype;

	proto.attributeChangedCallback = onAttr;

	if( options ){
		if( options.adopt ) proto.adoptedCallback = options.adopt;
		if( options.connect ) proto.connectedCallback = options.connect;
		if( options.disconnect ) proto.disconnectedCallback = options.disconnect;
	}

	customElements.define(name, CustomElement);

	return component;
}

$.customElement = createCustomElement;

})($);
