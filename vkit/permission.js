(function($, navigator){

var createState = $.state;
var onEvent = $.onEvent;
var render = $.render;
var unmount = $.unmount;

function createPermissionState(name, requestPermission, onError, nav){
	if(!nav){
		nav = navigator;
	}
	
	function grant(){
		if( permission.get() === "prompt" ){
			permission.set("granted");
		}
	}
	
	function deny(){
		if( permission.get() === "prompt" ){
			permission.set("denied");
		}
	}
	
	function request(){
		if( permission.get() === "prompt" ){
			requestPermission(grant, deny);
		}
	}
	
	function dismiss(){
		if( permission.get() === "prompt" ){
			permission.set("default");
		}
	}
	
	var asyncUnmount = unmount();
	var permission = createState("default");
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
	
	if( nav.permissions ){
		nav.permissions.query({name: name}).then(function(perm){
			permission.set(perm.state || perm.status);
			asyncUnmount(
				onEvent(perm, "change", function(){
					permission.set(perm.state || perm.status);
				})
			);
			render();
		}, function(error){
			if( typeof onError === "function" ){
				onError(error);
			}
			render();
		});
	}
	
	return prompt;
}

$.permission = createPermissionState;

})($, navigator);
