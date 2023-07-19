(function($){

var createComponent = $.createComponent;
var getComponent = $.getComponent;
var onUnmount = $.unmount;
var signalProp = $.signalProp;
var signalText = $.signalText;
var view = $.view;
var views = $.views;

function createComputedSignal(getValue){
	var parent = getComponent(true);
	var subscriptions = [];
	var value;
	
	var signalComponent = createComponent(function(){
		var newValue = getValue();
		
		if( value !== newValue ){
			value = newValue;
			
			var n = subscriptions.length;
			
			for(var i=0; i<n; ++i){
				subscriptions[i](value);
			}
		}
	});
	
	function use(){
		subscribe(getComponent().render);
		
		return get();
	}
	
	function get(){
		if( value === undefined ){
			signalComponent.render();
		}
		
		return value;
	}
	
	function subscribe(callback){
		var component = getComponent();
		var unmounted = false;
		
		subscriptions.push(function(value){
			if(!unmounted){
				callback(value);
			}
		});
		
		function unsubscribe(){
			unmounted = true;
			
			for(var i=subscriptions.length; i--;){
				if( subscriptions[i] === callback ){
					subscriptions.splice(i, 1);
					break;
				}
			}
		}
		
		if( component !== parent ){
			onUnmount(unsubscribe);
		}
		
		return unsubscribe;
	}
	
	use.component = parent;
	use.get = get;
	use.prop = signalProp;
	use.render = signalText;
	use.subscribe = subscribe;
	use.view = view;
	use.views = views;
	
	return use;
}

$.computed = createComputedSignal;

})($);
