(function($){

var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;
var onUnmount = $.unmount;
var signalProp = $.signalProp;
var signalText = $.signalText;
var view = $.view;
var views = $.views;

function createWritableSignal(value){
	var parent = getComponent(true);
	var subscriptions = [];
	var enqueued = false;
	
	function use(){
		subscribe(getComponent().render);
		
		return value;
	}
	
	function get(){
		return value;
	}
	
	function subscribe(callback){
		var component = getComponent(true);
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
	
	function set(newValue){
		if( value !== newValue ){
			value = newValue;
			
			if(!enqueued){
				enqueued = true;
				enqueueUpdate(updateSignal);
			}
		}
	}
	
	function updateSignal(){
		enqueued = false;
		
		var n = subscriptions.length;
			
		for(var i=0; i<n; ++i){
			subscriptions[i](value);
		}
	}
	
	use.add = add;
	use.component = parent;
	use.get = get;
	use.prop = signalProp;
	use.render = signalText;
	use.set = set;
	use.subscribe = subscribe;
	use.toggle = toggle;
	use.view = view;
	use.views = views;
	
	return use;
}

function add(value){
	this.set(this.get() + value);
}

function toggle(){
	this.set(!this.get());
}

$.signal = createWritableSignal;

})($);
