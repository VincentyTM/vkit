(function($) {

var getWindow = $.getWindow;
var signal = $.signal;
var update = $.update;

function battery() {
	var nav = getWindow().navigator;
	var battery = signal(null);
	
	var charging = battery.map(function(b) {
		return b ? b.charging : true;
	});
	
	var chargingTime = battery.map(function(b) {
		return b ? b.chargingTime : 0;
	});
	
	var dischargingTime = battery.map(function(b) {
		return b ? b.dischargingTime : Infinity;
	});
	
	var level = battery.map(function(b) {
		return b ? b.level : 1;
	});
	
	if (nav.getBattery) {
		nav.getBattery().then(function(b) {
			battery.set(b);
			update();
		});
		
		battery.effect(function(b) {
			if (b) {
				onUnmount(onEvent(b, "chargingchange", charging.invalidate));
				onUnmount(onEvent(b, "chargingtimechange", chargingTime.invalidate));
				onUnmount(onEvent(b, "dischargingtimechange", dischargingTime.invalidate));
				onUnmount(onEvent(b, "levelchange", level.invalidate));
			}
		});
	}
	
	return {
		charging: charging,
		chargingTime: chargingTime,
		dischargingTime: dischargingTime,
		isAvailable: battery.map(function(b) {
			return !!b;
		}),
		isSupported: !!nav.getBattery,
		level: level
	};
}

$.battery = battery;

})($);
