import { AsyncResult, AsyncStatus } from "./asyncEffect.js";

export function awaitResult<T>(asyncResult: AsyncResult<T>): T | undefined;

export function awaitResult<T>(asyncResult: AsyncResult<T>, pendingValue: T): T;

export function awaitResult<T>(asyncResult: AsyncResult<T>, pendingValue?: T): T | undefined {
	if (asyncResult.status === AsyncStatus.Resolved) {
		return asyncResult.value;
	}

	if (asyncResult.status === AsyncStatus.Rejected) {
		throw asyncResult.error;
	}

	return pendingValue;
}
