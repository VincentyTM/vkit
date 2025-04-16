import { AsyncResult, AsyncStatus } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { signal } from "./signal.js";

export function latestValue<T>(result: Signal<AsyncResult<T>>): Signal<T | undefined>;

export function latestValue<T>(
	result: Signal<AsyncResult<T>>,
	initialValue: T,
	onError?: (error: unknown) => void
): Signal<T>;

export function latestValue<T>(
	result: Signal<AsyncResult<T>>,
	initialValue?: T,
	onError?: (error: unknown) => void
): Signal<T | undefined> {
	var value = signal(initialValue);

	effect(function() {
		var currentResult = result();

		switch (currentResult.status) {
			case AsyncStatus.Resolved:
				value.set(currentResult.value);
				break;
			case AsyncStatus.Rejected:
				if (onError) {
					onError(currentResult.error);
				}
		}
	});

	return value;
}
