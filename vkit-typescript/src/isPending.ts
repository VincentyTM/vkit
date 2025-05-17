import { AsyncResult, AsyncStatus } from "./asyncEffect.js";
import { computed, Signal } from "./computed.js";

export function isPending(result: AsyncResult<unknown> | Signal<AsyncResult<unknown>>): Signal<boolean> {
    return computed(getIsPending, [result]);
}

function getIsPending(result: AsyncResult<unknown>): boolean {
    return result.status === AsyncStatus.Pending;
}
