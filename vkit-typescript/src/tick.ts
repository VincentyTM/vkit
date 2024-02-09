var ticks: (() => void)[] = [];

export default function tick(callback: () => void): void {
	ticks.push(callback);
}

export function callTicks(): void {
	var n = ticks.length;

	if (n) {
		var callbacks = ticks;

		ticks = [];
		
		for (var i = 0; i < n; ++i) {
			callbacks[i]();
		}
	}
}
