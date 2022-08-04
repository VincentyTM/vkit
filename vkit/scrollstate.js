(function($){

var unmount = $.unmount;
var onEvent = $.onEvent;
var createState = $.state;
var syncState = $.sync;
var afterRender = $.afterRender;

function createScrollState(el){
	var state = createState({
		x: 0,
		y: 0,
		width: 0,
		height: 0
	});
	state.x = syncState(
		state,
		function(scroll){
			return scroll.x;
		},
		function(x){
			var oldValue = state.get();
			return {
				x: Math.max(0, Math.min(x, oldValue.width)),
				y: oldValue.y,
				width: oldValue.width,
				height: oldValue.height
			};
		}
	);
	state.y = syncState(
		state,
		function(scroll){
			return scroll.y;
		},
		function(y){
			var oldValue = state.get();
			return {
				x: oldValue.x,
				y: Math.max(0, Math.min(y, oldValue.height)),
				width: oldValue.width,
				height: oldValue.height
			};
		}
	);
	var set = state.set;
	state.set = function(value){
		if( typeof value !== "object" ){
			throw new TypeError("Scroll state must be an object");
		}
		var oldValue = state.get();
		set({
			x: typeof value.x === "number" ? Math.max(0, Math.min(value.x, oldValue.width)) : oldValue.x,
			y: typeof value.y === "number" ? Math.max(0, Math.min(value.y, oldValue.height)) : oldValue.y,
			width: oldValue.width,
			height: oldValue.height
		});
	};
	function bind(el){
		function onScroll(){
			var html = this.documentElement || this;
			set({
				x: this.scrollLeft || el.scrollX || 0,
				y: this.scrollTop || el.scrollY || 0,
				width: html.scrollWidth - (isWindow ? el.innerWidth || html.clientWidth : html.clientWidth) || 0,
				height: html.scrollHeight - (isWindow ? el.innerHeight || html.clientHeight : html.clientHeight) || 0
			});
		}
		var isWindow = el.window === el;
		unmount(
			onEvent(isWindow ? el.document : el, "scroll", onScroll)
		);
		state.effect(isWindow
			? function(scroll){
				el.scrollTo(scroll.x, scroll.y);
			}
			: function(scroll){
				el.scrollLeft = scroll.x;
				el.scrollTop = scroll.y;
			}
		);
		afterRender(function(){
			onScroll.call(isWindow ? el.document : el);
		});
	}
	state.bind = bind;
	if( el ){
		bind(el);
	}
	return state;
}

$.scrollState = createScrollState;

})($);
