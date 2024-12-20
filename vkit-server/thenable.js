import createSignal from "./signal.js";

export default function thenable(signal) {
	signal.error = mapError;
	signal.pending = mapPending;
	signal.status = mapStatus;
	signal.then = then;
	signal.value = mapValue;
	return signal;
}

function mapStatus() {
	return this.map(getStatus);
}

function mapError() {
	return this.map(getError);
}

function mapPending() {
	return this.map(getPending);
}

function mapValue() {
	return this.map(getValue);
}

function getStatus(result) {
	return (
		result.fulfilled ? "fulfilled" :
		result.rejected ? "rejected" :
		result.pending ? "pending" :
		"default"
	);
}

function getError(result) {
	return result.error;
}

function getPending(result) {
	return !!result.pending;
}

function getValue(result) {
	return result.value;
}

function then() {
	return thenable(
		computed(function() {
			return {pending: true};
		})
	);
}
