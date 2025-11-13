import { noop } from "./noop.js";
import { onEvent } from "./onEvent.js";
import { Ref } from "./ref.js";
import { Template } from "./Template.js";

type DraggableElement = Element & ElementCSSInlineStyle & GlobalEventHandlers;

interface DraggableOptions<T> {
	/**
	 * A reference to the moved element.
	 * If set, the target element is moved instead of the draggable element.
	 * If not set, the draggable element is moved.
	 */
	readonly targetRef?: Ref<T>;

	/**
	 * An event listener that runs when the pointer is released and the dragging ends.
	 * @param element The element being moved. It might be different from the draggable element.
	 * @param x The horizontal pointer coordinate from the left side of the viewport.
	 * @param y The vertical pointer coordinate from the top of the viewport.
	 * @param position An event or touch object for extracting the position data.
	 */
	onDragEnd?(element: T, x: number, y: number, position: MouseEvent | Touch): void;

	/**
	 * An event listener that runs when the draggable element is being moved.
	 * @param element The element being moved. It might be different from the draggable element.
	 * @param x The horizontal pointer coordinate from the left side of the viewport.
	 * @param y The vertical pointer coordinate from the top of the viewport.
	 * @param position An event or touch object for extracting the position data.
	 */
	onDragMove?(element: T, x: number, y: number, position: MouseEvent | Touch): void;

	/**
	 * An event listener that runs when the pointer is pressed and the dragging starts.
	 * @param element The element being moved. It might be different from the draggable element.
	 * @param x The horizontal pointer coordinate from the left side of the viewport.
	 * @param y The vertical pointer coordinate from the top of the viewport.
	 * @param position An event or touch object for extracting the position data.
	 */
	onDragStart?(element: T, x: number, y: number, position: MouseEvent | Touch): void;
}

/**
 * Makes an absolute or fixed positioned element draggable.
 * @example
 * function DraggableBox() {
 * 	return Div(
 * 		draggable(),
 * 		"I am draggable!",
 * 		{
 * 			style: {
 * 				position: "absolute",
 * 				cursor: "move"
 * 			}
 * 		}
 * 	);
 * }
 * @param options An optional configuration object.
 * @returns A template that makes its container element draggable.
 */
export function draggable(options?: DraggableOptions<DraggableElement>): Template<DraggableElement> {
	var dragEnd = options && options.onDragEnd || noop;
	var dragMove = options && options.onDragMove || defaultDragMove;
	var dragStart = options && options.onDragStart || noop;
	var targetRef = options && options.targetRef;
	
	return {
		style: {
			touchAction: "none"
		},
		
		onmousedown: function(this: DraggableElement, mouseDownEvent: MouseEvent): void {
			mouseDownEvent.preventDefault();
			mouseDownEvent.stopPropagation();
			
			var elNodeOrNull = targetRef ? targetRef.current : this;
			
			if (elNodeOrNull === null) {
				return;
			}
			
			var elNode = elNodeOrNull;
			var startX = getMouseX(mouseDownEvent, elNode);
			var startY = getMouseY(mouseDownEvent, elNode);
			var elStartLeft = parseInt(getStyle(elNode, "left")) || 0;
			var elStartTop = parseInt(getStyle(elNode, "top")) || 0;
			
			dragStart(
				elNode,
				elStartLeft,
				elStartTop,
				mouseDownEvent
			);
			
			function dragMoveListener(mouseMoveEvent: MouseEvent): void {
				dragMove(
					elNode,
					elStartLeft + getMouseX(mouseMoveEvent, elNode) - startX,
					elStartTop + getMouseY(mouseMoveEvent, elNode) - startY,
					mouseMoveEvent
				);
			}
			
			function dragEndListener(mouseUpEvent: MouseEvent): void {
				removeMouseMoveListener();
				removeMouseLeaveListener();
				removeMouseUpListener();
				
				dragEnd(
					elNode,
					elStartLeft + getMouseX(mouseUpEvent, elNode) - startX,
					elStartTop + getMouseY(mouseUpEvent, elNode) - startY,
					mouseUpEvent
				);
			}
			
			var removeMouseMoveListener = onEvent(elNode.ownerDocument, "mousemove", dragMoveListener);
			var removeMouseLeaveListener = onEvent(elNode.ownerDocument, "mouseleave", dragEndListener);
			var removeMouseUpListener = onEvent(elNode.ownerDocument, "mouseup", dragEndListener);
		},
		
		ontouchstart: function(this: DraggableElement, touchStartEvent: TouchEvent): void {
			touchStartEvent.preventDefault();
			touchStartEvent.stopPropagation();
			
			var elNodeOrNull = targetRef ? targetRef.current : this;
			
			if (elNodeOrNull === null) {
				return;
			}
			
			var elNode = elNodeOrNull;
			var startX = getTouchX(touchStartEvent);
			var startY = getTouchY(touchStartEvent);
			var elStartLeft = parseInt(getStyle(elNode, "left")) || 0;
			var elStartTop = parseInt(getStyle(elNode, "top")) || 0;
			
			dragStart(
				elNode,
				elStartLeft,
				elStartTop,
				touchStartEvent.touches[0]
			);
			
			function dragMoveListener(touchMoveEvent: TouchEvent): void {
				touchMoveEvent.preventDefault();
				touchMoveEvent.stopPropagation();
				
				dragMove(
					elNode,
					elStartLeft + getTouchX(touchMoveEvent) - startX,
					elStartTop + getTouchY(touchMoveEvent) - startY,
					touchMoveEvent.touches[0]
				);
			}
			
			function dragEndListener(touchEndEvent: TouchEvent): void {
				removeTouchMoveListener();
				removeTouchCancelListener();
				removeTouchEndListener();
				
				dragEnd(
					elNode,
					elStartLeft + getTouchX(touchEndEvent) - startX,
					elStartTop + getTouchY(touchEndEvent) - startY,
					touchEndEvent.touches[0]
				);
			}
			
			var removeTouchMoveListener = onEvent(elNode.ownerDocument, "touchmove", dragMoveListener);
			var removeTouchCancelListener = onEvent(elNode.ownerDocument, "touchcancel", dragEndListener);
			var removeTouchEndListener = onEvent(elNode.ownerDocument, "touchend", dragEndListener);
		},

		onselectstart: preventDefault
	};
}

function defaultDragMove(el: ElementCSSInlineStyle, x: number, y: number): void {
	el.style.left = x + "px";
	el.style.top = y + "px";
}

function getStyle(el: DraggableElement, prop: "left" | "top"): string {
	if (typeof getComputedStyle === "function") {
		return getComputedStyle(el, null).getPropertyValue(prop);
	}
	
	if ((el as any).currentStyle) {
		return (el as any).currentStyle[prop];
	}
	
	if (el.style) {
		return el.style[prop];
	}
	
	return "";
}

function getMouseX(e: MouseEvent, el: Node): number {
	if (typeof e.pageX === "number") {
		return e.pageX;
	}

	var doc = el.ownerDocument;

	if (doc === null) {
		return 0;
	}

	var win: Window & typeof globalThis | null = doc.defaultView || (doc as any).parentWindow;

	if (win === null) {
		return 0;
	}
	
	return e.clientX + (
		win.scrollX || doc.documentElement.scrollLeft + (doc.body ? doc.body.scrollLeft : 0) || 0
	);
}

function getMouseY(e: MouseEvent, el: Node): number {
	if (typeof e.pageY === "number") {
		return e.pageY;
	}

	var doc = el.ownerDocument;

	if (doc === null) {
		return 0;
	}

	var win: Window & typeof globalThis | null = doc.defaultView || (doc as any).parentWindow;

	if (win === null) {
		return 0;
	}
	
	return e.clientY + (
		win.scrollY || doc.documentElement.scrollTop + (doc.body ? doc.body.scrollTop : 0) || 0
	);
}

function getTouchX(e: TouchEvent): number {
	return e.touches[0] && e.touches[0].pageX || 0;
}

function getTouchY(e: TouchEvent): number {
	return e.touches[0] && e.touches[0].pageY || 0;
}

function preventDefault(e: Event): void {
	e.preventDefault();
}
