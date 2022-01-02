(function($){

var unmount = $.unmount;
var onEvent = $.onEvent;
var createState = $.state;
var syncState = $.sync;

function createScrollState(el){
	var state = createState({
		x: 0,
		y: 0,
		w: 0,
		h: 0
	});
	state.x = syncState(
		state,
		function(scroll){
			return scroll.x;
		},
		function(x){
			setByEvent = false;
			var oldValue = state.get();
			return {
				x: Math.min(x, oldValue.w),
				y: oldValue.y,
				w: oldValue.w,
				h: oldValue.h
			};
		}
	);
	state.y = syncState(
		state,
		function(scroll){
			return scroll.y;
		},
		function(y){
			setByEvent = false;
			var oldValue = state.get();
			return {
				x: oldValue.x,
				y: Math.min(y, oldValue.h),
				w: oldValue.w,
				h: oldValue.h
			};
		}
	);
	var set = state.set;
	var setByEvent = false;
	state.set = function(value){
		if( typeof value !== "object" ){
			throw new TypeError("Scroll state must be an object");
		}
		var oldValue = state.get();
		set({
			x: typeof value.x === "number" ? Math.min(value.x, oldValue.w) : oldValue.x,
			y: typeof value.y === "number" ? Math.min(value.y, oldValue.h) : oldValue.y,
			w: oldValue.w,
			h: oldValue.h
		});
		setByEvent = false;
	};
	function bind(el){
		function onScroll(){
			var html = this.documentElement || this;
			set({
				x: this.scrollLeft || el.scrollX || 0,
				y: this.scrollTop || el.scrollY || 0,
				w: html.scrollWidth - (isWindow ? el.innerWidth || html.clientWidth : html.clientWidth) || 0,
				h: html.scrollHeight - (isWindow ? el.innerHeight || html.clientHeight : html.clientHeight) || 0
			});
			setByEvent = true;
		}
		var isWindow = el.window === el;
		unmount(
			onEvent(isWindow ? el.document : el, "scroll", onScroll)
		);
		unmount(
			state.onChange.subscribe(isWindow
				? function(scroll){
					if(!setByEvent){
						el.scrollTo(scroll.x, scroll.y);
					}
				}
				: function(scroll){
					if(!setByEvent){
						el.scrollLeft = scroll.x;
						el.scrollTop = scroll.y;
					}
				}
			)
		);
	}
	state.bind = bind;
	if( el ){
		bind(el);
	}
	return state;
}

$.scrollState = createScrollState;

})($);
