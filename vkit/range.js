(function($){

var easingFunctions = $.easing;

function interpolateNumbers(a, b, p){
	return a + (b - a)*p;
}

function getKeyframesOf(array){
	var n = array.length;
	if( n === 0 ){
		throw new Error("Interpolation array cannot be empty");
	}
	var keyframes = new Array(n);
	var sum = 0;
	var noAtSince = -1;
	for(var i=0; i<n; ++i){
		var item = array[i];
		if( typeof item !== "object" ){
			item = {
				value: item
			};
		}
		if( typeof item.at === "number" ){
			if( noAtSince !== -1 ){
				if( noAtSince === 0 ){
					for(var j=0; j<i; ++j){
						keyframes[j].at = item.at*j/i;
					}
				}else{
					for(var j=noAtSince; j<i; ++j){
						keyframes[j].at = sum + (item.at - sum)*(j-noAtSince+1)/(i-noAtSince+1);
					}
				}
				noAtSince = -1;
			}
			if( item.at <= sum && i > 0 ){
				throw new Error("Interpolation sequence must be strictly increasing");
			}
			sum = item.at;
		}else if( noAtSince === -1 ){
			noAtSince = i;
		}
		keyframes[i] = {
			at: sum,
			value: item.value,
			easing: item.easing || null
		};
		if( typeof item.duration === "number" ){
			sum += item.duration;
		}
	}
	if( noAtSince !== -1 ){
		if( n === noAtSince + 1 ){
			keyframes[n-1].at = 1;
		}else{
			for(var i=noAtSince; i<n; ++i){
				keyframes[i].at = sum + (1 - sum) * (i-noAtSince)/(n-1-noAtSince);
			}
		}
	}
	if( keyframes[n-1].at < sum ){
		keyframes.push({
			at: sum,
			value: keyframes[n-1].value,
			easing: null
		});
	}
	return keyframes;
}

function createRange(array, interpolate, thirdArg){
	if(!(typeof array === "object" && array)){
		array = [
			{
				at: 0,
				value: array
			},
			{
				at: 1,
				value: interpolate
			}
		];
		interpolate = thirdArg;
	}
	if(!interpolate){
		interpolate = interpolateNumbers;
	}
	var keyframes;
	if( array.effect ){
		array.effect(function(value){
			keyframes = getKeyframesOf(value);
		});
	}else{
		keyframes = getKeyframesOf(array);
	}
	function at(state){
		return state.map(get);
	}
	function get(at){
		var n = keyframes.length;
		if( at <= keyframes[0].at ){
			return keyframes[0].value;
		}
		for(var i=1; i<n; ++i){
			var next = keyframes[i];
			if( next.at < at ){
				continue;
			}
			if( next.at === at ){
				return next.value;
			}
			var prev = keyframes[i-1];
			if( prev.value === next.value ){
				return prev.value;
			}
			if( isNaN(next.value) ){
				return prev.value;
			}
			if( isNaN(prev.value) ){
				return next.value;
			}
			var easing = next.easing || null;
			if( typeof easing === "string" ){
				easing = easingFunctions[easing] || null;
			}
			var p = (at - prev.at) / (next.at - prev.at);
			if( easing ){
				p = easing(p);
			}
			return interpolate(prev.value, next.value, p);
		}
		return keyframes[n-1].value;
	}
	function getDuration(){
		return keyframes[keyframes.length-1].at;
	}
	function getKeyframes(){
		return keyframes;
	}
	return {
		at: at,
		get: get,
		getDuration: getDuration,
		getKeyframes: getKeyframes
	};
}

$.range = createRange;

})($);
