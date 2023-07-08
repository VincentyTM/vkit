(function($, window){

var createObservable = $.observable;
var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;
var update = $.update;

function createNotificationManager(onError, win){
	if(!win){
		win = window;
	}
	
	var nav = win.navigator;
	var Notification = win.Notification;
	var isSupported = typeof Notification === "function";
	
	var permission = createState(
		isSupported
			? (Notification.permission === "default" ? "prompt" : Notification.permission)
			: "default"
	);
	
	var prompt = permission.map(function(perm){
		if( perm === "granted" ){
			return {
				state: "granted",
				granted: true
			};
		}
		
		if( perm === "denied" ){
			return {
				state: "denied",
				denied: true
			};
		}
		
		if( perm === "prompt" ){
			return {
				state: "prompt",
				prompt: true,
				request: request,
				dismiss: dismiss
			};
		}
		
		return {
			state: "default"
		};
	});
	
	var asyncUnmount = unmount();
	
	if( nav.permissions ){
		nav.permissions.query({name: "notifications"}).then(function(perm){
			permission.set(perm.state || perm.status);
			asyncUnmount(
				onEvent(perm, "change", function(){
					permission.set(perm.state || perm.status);
				})
			);
		}, function(error){
			if( typeof onError === "function" ){
				onError(error);
			}
			
			update();
		});
	}
	
	function request(){
		if( isSupported && Notification.permission !== "granted" && permission.get() === "prompt" ){
			Notification.requestPermission(function(perm){
				permission.set(perm === "default" ? "prompt" : perm);
				update();
			});
		}
	}
	
	function dismiss(){
		if( permission.get() === "prompt" ){
			permission.set("default");
		}
	}
	
	function granted(){
		return permission.get() === "granted";
	}
	
	function showNotification(title, options, onError){
		if(!isSupported ){
			if( typeof onError === "function" ){
				onError(new Error("Notification API is not supported"));
			}
			
			return;
		}
		
		if(!granted()){
			if( typeof onError === "function" ){
				onError(new Error("Notifications are not granted by the user"));
			}
			
			return;
		}
		
		if( nav.serviceWorker ){
			nav.serviceWorker.ready.then(function(reg){
				return reg.showNotification(title, options);
			}, function(error){
				try{
					new Notification(title, options);
				}catch(ex){
					if( typeof onError === "function" ){
						onError(error);
					}
				}
				
				update();
			});
		}else{
			new Notification(title, options);
		}
	}
	
	return {
		granted: granted,
		permission: prompt,
		requestPermission: request,
		show: showNotification
	};
}

$.notification = createNotificationManager;

})($, window);
