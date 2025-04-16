import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

export enum AsyncStatus {
	Pending,
	Rejected,
	Resolved,
}

export type AsyncResult<T> = (
	| PendingAsyncResult
	| RejectedAsyncResult
	| ResolvedAsyncResult<T>
);

interface PendingAsyncResult {
	status: AsyncStatus.Pending;
}

interface RejectedAsyncResult {
	status: AsyncStatus.Rejected;
	error: unknown;
}

interface ResolvedAsyncResult<T> {
	status: AsyncStatus.Resolved;
	value: T;
}

interface Thenable<T> {
	then(
		resolveHandler: (value: T) => void,
		rejectHandler: (error: unknown) => void
	): void;
}

var PENDING: AsyncResult<never> = {status: AsyncStatus.Pending};

function isThenable(value: any): value is Thenable<unknown> {
	return !!(value && typeof value.then === "function");
}

export function asyncEffect<T>(asyncCallback: Thenable<T> | (() => Thenable<T> | T)): Signal<AsyncResult<T>> {
	var result = signal<AsyncResult<T>>(PENDING);
	var latestThenable: Thenable<T> | undefined;

	effect(function(): void {
		try {
			var returnValue = typeof asyncCallback === "function" ? asyncCallback() : asyncCallback;

			if (isThenable(returnValue)) {
				latestThenable = returnValue;
				result.set(PENDING);
				returnValue.then(resolve, reject);
			} else {
				latestThenable = undefined;
				result.set({
					status: AsyncStatus.Resolved,
					value: returnValue
				});
			}
		} catch (error) {
			reject(error);
		}

		function resolve(value: T): void {
			if (latestThenable === returnValue) {
				result.set({
					status: AsyncStatus.Resolved,
					value: value
				});
			}
		}

		function reject(error: unknown): void {
			if (latestThenable === returnValue) {
				result.set({
					status: AsyncStatus.Rejected,
					error: error
				});
			}
		}
	});

	onDestroy(function(): void {
		latestThenable = undefined;
	});

	return result;
}
