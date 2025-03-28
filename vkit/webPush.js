(function($) {

var getWindow = $.getWindow;
var map = $.map;
var notification = $.notification;
var readOnly = $.readOnly;
var signal = $.signal;
var tick = $.tick;
var update = $.update;

function areEqual(a, b) {
	a = new Uint8Array(a);
	b = new Uint8Array(b);
	var n = a.byteLength;
	
	if (n !== b.byteLength) {
		return false;
	}
	
	for (var i = 0; i < n; ++i) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	
	return true;
}

function createWebPushManager(serviceWorker, serverKey) {
	function onError(ex) {
		locked = false;
		error.set(ex);
		update();
	}
	
	function finish() {
		locked = false;
		
		if (queued) {
			queued = false;
			setSubscription(serviceWorker.get(), serverKey.get());
		}
	}
	
	var win = getWindow();
	var nav = win.navigator;
	var permission = notification(onError, win).permission;
	var subscription = signal(null);
	var error = signal(null);
	var locked = false;
	var queued = false;
	
	function setSubscription(reg, serverKey) {
		function subscribe() {
			reg.pushManager.subscribe({
				"userVisibleOnly": true,
				"applicationServerKey": serverKey
			}).then(function(sub) {
				subscription.set(sub);
				finish();
				update();
			}, function(error) {
				subscription.set(null);
				onError(error);
				tick(function() {
					setSubscription(reg, serverKey);
				});
			});
		}
		
		if (locked) {
			queued = true;
			return;
		}
		
		locked = true;
		
		reg.pushManager.getSubscription().then(function(sub) {
			if (serverKey) {
				if (sub) {
					if (areEqual(sub.options.applicationServerKey, serverKey)) {
						var last = subscription.get();
						
						if (!last || !areEqual(last, sub)) {
							subscription.set(sub);
						}
						
						finish();
					} else {
						sub.unsubscribe().then(subscribe, onError);
					}
				} else {
					subscribe();
				}
			} else if (sub) {
				sub.unsubscribe().then(function() {
					subscription.set(null);
					finish();
					update();
				}, onError);
			} else {
				finish();
			}
			
			update();
		}, onError);
	}
	
	var getSubscription = map(function(reg, serverKey) {
		if (!reg) {
			return;
		}
		
		if (!reg.pushManager) {
			onError(new Error("PushManager is not available on this object"));
			return;
		}
		
		setSubscription(reg, serverKey);
	});
	
	getSubscription(serviceWorker, serverKey, permission);
	
	var result = readOnly(subscription);
	result.onError = error.subscribe;
	return result;
}

$.webPush = createWebPushManager;

})($, window);
