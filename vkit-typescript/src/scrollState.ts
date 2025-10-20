import { deriveSignal } from "./deriveSignal.js";
import { effect } from "./effect.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal, WritableSignal } from "./signal.js";
import { tick } from "./tick.js";

export interface ScrollData {
	height: number;
	width: number;
	x: number;
	y: number;
}

export interface ScrollState {
	data: WritableSignal<ScrollData>;
	x: WritableSignal<number>;
	y: WritableSignal<number>;
	bindElement(scrollable: Element): void;
	bindWindow(scrollable: Window): void;
}

function setWindowScroll(rawData: WritableSignal<ScrollData>, win: Window): void {
	var html = win.document.documentElement;

	rawData.set({
		x: win.scrollX,
		y: win.scrollY,
		width: html.scrollWidth - (win.innerWidth || html.clientWidth),
		height: html.scrollHeight - (win.innerHeight || html.clientHeight)
	});
}

function setElementScroll(rawData: WritableSignal<ScrollData>, el: Element): void {
	rawData.set({
		x: el.scrollLeft,
		y: el.scrollTop,
		width: el.scrollWidth - el.clientWidth,
		height: el.scrollHeight - el.clientHeight
	});
}

export function scrollState(): ScrollState {
	var rawData = signal<ScrollData>({
		x: 0,
		y: 0,
		width: 0,
		height: 0
	});

	var data = deriveSignal(
		rawData,

		function(scroll) {
			return scroll;
		},

		function(oldValue, value) {
			return {
				x: typeof value.x === "number" ? Math.max(0, Math.min(value.x, oldValue.width)) : oldValue.x,
				y: typeof value.y === "number" ? Math.max(0, Math.min(value.y, oldValue.height)) : oldValue.y,
				width: oldValue.width,
				height: oldValue.height
			};
		}
	);
	
	var x = deriveSignal(
		data,
		
		function(scroll) {
			return scroll.x;
		},
		
		function(oldValue, x) {
			return {
				x: Math.max(0, Math.min(x, oldValue.width)),
				y: oldValue.y,
				width: oldValue.width,
				height: oldValue.height
			};
		}
	);
	
	var y = deriveSignal(
		data,
		
		function(scroll) {
			return scroll.y;
		},
		
		function(oldValue, y) {
			return {
				x: oldValue.x,
				y: Math.max(0, Math.min(y, oldValue.height)),
				width: oldValue.width,
				height: oldValue.height
			};
		}
	);
	
	function bindElement(scrollable: Element): void {
		onDestroy(
			onEvent(scrollable, "scroll", function() {
				setElementScroll(rawData, scrollable);
			})
		);
		
		effect(function() {
			var scroll = data();
			scrollable.scrollLeft = scroll.x;
			scrollable.scrollTop = scroll.y;
		});
		
		tick(function() {
			setElementScroll(rawData, scrollable);
		});
	}
	
	function bindWindow(scrollable: Window): void {
		onDestroy(
			onEvent(scrollable.document, "scroll", function() {
				setWindowScroll(rawData, scrollable);
			})
		);
		
		effect(function() {
			var scroll = data();
			scrollable.scrollTo(scroll.x, scroll.y);
		});
		
		tick(function() {
			setWindowScroll(rawData, scrollable);
		});
	}
	
	return {
		data: data,
		x: x,
		y: y,
		bindElement: bindElement,
		bindWindow: bindWindow
	};
}
