(function($, undefined){

var group = $.group;
var append = $.append;
var render = $.render;
var setProps = $.setProps;
var createState = $.state;
var syncState = $.sync;

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

		function attr(name, defaultValue){
			if( name === undefined ){
				return new Proxy({}, {
					get: getAttr
				});
			}

			function onAttrChange(value){
				if( value === null ){
					el.removeAttribute(name);
				}else{
					el.setAttribute(name, value);
				}
			}

			if(!(name in attrs)){
				var state = createState(el.getAttribute(name));
				state.onChange.subscribe(onAttrChange);
				attrs[name] = state;
			}

			var attrState = attrs[name];
			if( defaultValue !== undefined && defaultValue !== null ){
				attrState = syncState(attrState, function(value){
					return value !== undefined && value !== null ? value : defaultValue;
				});
			}

			return attrState;
		}

		function getAttr(target, prop, receiver){
			return attr(prop);
		}

		var view = component(el, attr);
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

	var proto = CustomElement.prototype;

	if( options ){
		if( options.adopt ) proto.adoptedCallback = options.adopt;
		if( options.connect ) proto.connectedCallback = options.connect;
		if( options.disconnect ) proto.disconnectedCallback = options.disconnect;
		if( options.observe ){
			CustomElement.observedAttributes = options.observe;
			proto.attributeChangedCallback = onAttr;
		}
	}

	customElements.define(name, CustomElement);

	return component;
}

$.customElement = createCustomElement;

})($);
