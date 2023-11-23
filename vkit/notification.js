(function($) {

var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var signal = $.signal;
var update = $.update;

function createNotificationManager(handleError, win) {
	if(!win){
		win = getWindow();
	}
	
	var nav = win.navigator;
	var Notification = win.Notification;
	var isSupported = typeof Notification === "function";
	
	var permission = signal(
		isSupported
			? (Notification.permission === "default" ? "prompt" : Notification.permission)
			: "default"
	);
	
	var prompt = permission.map(function(perm) {
		if (perm === "granted") {
			return {
				state: "granted",
				granted: true
			};
		}
		
		if (perm === "denied") {
			return {
				state: "denied",
				denied: true
			};
		}
		
		if (perm === "prompt") {
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
	
	var asyncUnmount = onUnmount();
	
	if (nav.permissions) {
		nav.permissions.query({name: "notifications"}).then(function(perm) {
			permission.set(perm.state || perm.status);
			asyncUnmount(
				onEvent(perm, "change", function() {
					permission.set(perm.state || perm.status);
				})
			);
		}, function(error) {
			if (typeof handleError === "function") {
				handleError(error);
			}
			
			update();
		});
	}
	
	function request() {
		if (isSupported && Notification.permission !== "granted" && permission.get() === "prompt") {
			Notification.requestPermission(function(perm) {
				permission.set(perm === "default" ? "prompt" : perm);
				update();
			});
		}
	}
	
	function dismiss() {
		if (permission.get() === "prompt") {
			permission.set("default");
		}
	}
	
	function granted() {
		return permission.get() === "granted";
	}
	
	function showNotification(title, options, handleError) {
		if (!isSupported) {
			if (typeof handleError === "function") {
				handleError(new Error("Notification API is not supported"));
			}
			
			return null;
		}
		
		if (!granted()) {
			if (typeof handleError === "function") {
				handleError(new Error("Notifications are not granted by the user"));
			}
			
			return null;
		}
		
		try {
			return new Notification(title, options);
		} catch(ex) {
			if (nav.serviceWorker) {
				nav.serviceWorker.ready.then(function(reg) {
					return reg.showNotification(title, options);
				}, function(error) {
					if (typeof handleError === "function") {
						handleError(error);
					}
					
					update();
				});
			} else if (typeof handleError === "function") {
				handleError(ex);
			}
			
			return null;
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
