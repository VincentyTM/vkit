(function($){

var easings = $.easing;
var toString = Object.prototype.toString;

function getIndexAt(array, time, n){
	var a = 0;
	var b = n;
	while( a < b ){
		var m = (a + b) >> 1;
		if( time < array[m].start ){
			b = m;
		}else if( array[m].end < time || (m + 1 < n && array[m + 1].start <= time) ){
			a = m + 1;
		}else{
			return m;
		}
	}
	return b - 1;
}

function getValueAt(array, time, mix){
	if( typeof array === "function" ){
		return array(time, mix);
	}
	if( toString.call(array) !== "[object Array]" ){
		return array;
	}
	var n = array.length;
	if( n === 0 ){
		throw new RangeError("Cannot get value from zero-length array");
	}
	var end = array[n - 1].end;
	if( end <= time ){
		time = Math.round((time - end * Math.floor(time / end)) * 1e12) / 1e12;
	}
	if( n === 1 ){
		return getValueAt(array[0].value, time - array[0].start, mix);
	}
	var i = getIndexAt(array, time, n);
	if( i === -1 ){
		return interpolate(array[n - 1], array[0], time, mix);
	}
	if( i + 1 === n ){
		return getValueAt(array[n - 1].value, time - array[n - 1].start, mix);
	}
	if( array[i].end < time ){
		return interpolate(array[i], array[i + 1], time, mix);
	}
	return getValueAt(array[i].value, time - array[i].start, mix);
}

function interpolate(a, b, time, mix){
	var bValue = getValueAt(b.value, time - b.start, mix);
	if( a.end === b.start ){
		return bValue;
	}
	var t;
	if( a.end > b.start ){
		if( b.start === 0 ){
			return bValue;
		}
		t = time / b.start;
	}else{
		t = (time - a.end) / (b.start - a.end);
	}
	var easing = b.easing;
	if( easing ){
		if( easing in easings ){
			easing = easings[easing];
		}
		if( typeof easing === "function" ){
			t = easing(t);
		}
	}
	var aValue = getValueAt(a.value, time - a.start, mix);
	if( typeof mix === "function" ){
		return mix(aValue, bValue, t);
	}
	return aValue * (1 - t) + bValue * t;
}

$.valueAt = getValueAt;

})($);
