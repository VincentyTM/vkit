import isSignal from "./isSignal";
import {Signal} from "./signal";
import {View} from "./view";

var MAX_COUNT = 9007199254740991;

function getNumber(num: number) {
	return !(num >= 0) ? 0 : num >= MAX_COUNT ? MAX_COUNT : Math.floor(num);
}

function createRangeArray(length: number) {
	length = getNumber(length);
	var array = new Array<number>(length);
	
	for (var i = 0; i < length; ++i) {
		array[i] = i;
	}
	
	return array;
}

export default function repeat(
	count: number | Signal<number>,
	getView: (index: number) => View
) {
	if (isSignal(count)) {
		var arrayState = (count as Signal<number>).map(createRangeArray);
		return arrayState.views(getView);
	}
	
	count = getNumber(count as number);
	
	var array = new Array<View>(count);
	
	for (var i = 0; i < count; ++i) {
		array[i] = getView(i);
	}
	
	return array;
}
