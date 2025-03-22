(function($) {

var getEffect = $.getEffect;
var getWindow = $.getWindow;
var onDestroy = $.onDestroy;
var onEvent = $.onEvent;
var signal = $.signal;
var update = $.update;

function permissionPrompt(name, requestPermission, onError) {
	var component = getEffect();
	var nav = getWindow().navigator;
	
	function grant() {
		if (permission.get() === "prompt") {
			permission.set("granted");
		}
	}
	
	function deny() {
		if (permission.get() === "prompt") {
			permission.set("denied");
		}
	}
	
	function request() {
		if (permission.get() === "prompt") {
			requestPermission(grant, deny);
		}
	}
	
	function dismiss() {
		if (permission.get() === "prompt") {
			permission.set("default");
		}
	}
	
	var permission = signal("default");
	
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
	
	var unsubscribe;
	
	onDestroy(function() {
		if (unsubscribe) {
			unsubscribe();
		}
	});
	
	if (nav.permissions) {
		nav.permissions.query({name: name}).then(function(perm) {
			permission.set(perm.state || perm.status);
			
			unsubscribe = onEvent(perm, "change", function() {
				permission.set(perm.state || perm.status);
			});
			
			update();
		}, function(error) {
			if (typeof onError === "function") {
				onError(error);
			}
			
			update();
		});
	}
	
	return prompt;
}

$.permission = permissionPrompt;

})($);
