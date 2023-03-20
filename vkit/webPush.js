(function($, window){

var createState = $.state;
var map = $.map;
var notification = $.notification;
var render = $.render;
var tick = $.tick;

function areEqual(a, b){
	a = new Uint8Array(a);
	b = new Uint8Array(b);
	var n = a.byteLength;
	if( n !== b.byteLength ){
		return false;
	}
	for(var i=0; i<n; ++i){
		if( a[i] !== b[i] ){
			return false;
		}
	}
	return true;
}

function createWebPushManager(serviceWorker, serverKey, handleError, win){
	if(!win){
		win = window;
	}
	
	function onError(error){
		locked = false;
		if( typeof handleError === "function" ){
			handleError(error);
		}
		render();
	}
	
	function finish(){
		locked = false;
		if( queued ){
			queued = false;
			setSubscription(serviceWorker.get(), serverKey.get());
		}
	}
	
	var nav = win.navigator;
	var permission = notification(onError, win).permission;
	var subscription = createState(null);
	var locked = false;
	var queued = false;
	
	function setSubscription(reg, serverKey){
		function subscribe(){
			reg.pushManager.subscribe({
				"userVisibleOnly": true,
				"applicationServerKey": serverKey
			}).then(function(sub){
				subscription.set(sub);
				finish();
				render();
			}, function(error){
				subscription.set(null);
				onError(error);
				tick(function(){
					setSubscription(reg, serverKey);
				});
			});
		}
		
		if( locked ){
			queued = true;
			return;
		}
		
		locked = true;
		
		reg.pushManager.getSubscription().then(function(sub){
			if( serverKey ){
				if( sub ){
					if( areEqual(sub.options.applicationServerKey, serverKey) ){
						var last = subscription.get();
						if(!last || !areEqual(last, sub)){
							subscription.set(sub);
						}
						finish();
					}else{
						sub.unsubscribe().then(subscribe, onError);
					}
				}else{
					subscribe();
				}
			}else if( sub ){
				sub.unsubscribe().then(function(){
					subscription.set(null);
					finish();
					render();
				}, onError);
			}else{
				finish();
			}
			render();
		}, onError);
	}
	
	var getSubscription = map(function(reg, serverKey){
		if(!reg){
			return;
		}
		
		if(!reg.pushManager){
			onError(new Error("PushManager is not available on this object"));
			return;
		}
		
		setSubscription(reg, serverKey);
	});
	
	getSubscription(serviceWorker, serverKey, permission);
	
	return subscription;
}

$.webPush = createWebPushManager;

})($, window);