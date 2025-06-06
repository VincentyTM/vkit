import { ComputedSignal, Signal } from "./computed.js";
import { createEffect } from "./createEffect.js";
import { WindowService } from "./getWindow.js";
import { inject } from "./inject.js";
import { isSignal } from "./isSignal.js";
import { noop } from "./noop.js";
import { onDestroy } from "./onDestroy.js";
import { signal, WritableSignal } from "./signal.js";
import { updateEffect } from "./updateEffect.js";

export interface WindowData<T> {
	parts: WritableSignal<WindowDataPart<T>[]>;
	signal: ComputedSignal<unknown>;
}

type WindowDataPart<T> = T | Signal<T> | ((part: T) => T);

type WindowDataValue = string | object;

type InitFunction<T> = (
	window: Window,
	callback: (value: T, callEffect: () => void) => void
) => void;

function getValue<T extends WindowDataValue>(parts: WindowDataPart<T>[], value: T): T {
	var n = parts.length;
	
	for (var i = 0; i < n; ++i) {
		var part = parts[i];
		
		if (isSignal(part)) {
			part = part.get();
		}
		
		if (typeof part === "function") {
			value = part(value);
		} else {
			value = part;
		}
	}
	
	return value;
}

function getData<T extends WindowDataValue>(key: string, init: InitFunction<T>): WindowData<T> {
	var windowService = inject(WindowService);
	
	if (!windowService.data) {
		windowService.data = {};
	}
	
	if (windowService.data[key]) {
		return windowService.data[key];
	}

	var result: WindowData<T> | undefined;
	
	var parentEffect = windowService.effect;
	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var parts = signal<WindowDataPart<T>[]>([]);
		var initialValue: T;
		var callEffect = noop;
		
		if (windowService.window) {
			init(windowService.window, function(value, effect) {
				initialValue = value;
				callEffect = effect;
			});
		}
		
		var valueSignal = parts.map(function(parts) {
			return getValue(parts, initialValue);
		});
		
		valueSignal.effect(callEffect);
		
		result = {
			parts: parts,
			signal: valueSignal
		};
		
		if (windowService.data) {
			windowService.data[key] = result;
		}
	});

	updateEffect(effect);

	if (result === undefined) {
		throw new Error("Data is not set");
	}

	return result;
}

export function windowData<T extends WindowDataValue>(key: string, init: InitFunction<T>) {
	function use(): ComputedSignal<T>;

	function use(part: WindowDataPart<T>): void;

	function use(part?: WindowDataPart<T>) {
		var data = getData(key, init);
		
		if (part === undefined) {
			return data.signal;
		}
		
		var parts = data.parts;
		
		if (isSignal(part)) {
			part.subscribe(data.signal.invalidate);
		}
		
		parts.set(parts.get().concat([part]));
		
		onDestroy(function(): void {
			var ps = parts.get();
			
			for (var i = ps.length; i--;) {
				if (ps[i] === part) {
					parts.set(
						ps.slice(0, i).concat(
							ps.slice(i + 1)
						)
					);
					break;
				}
			}
		});
	};

	return use;
}
