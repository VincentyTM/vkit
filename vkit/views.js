(function($) {

var createComponent = $.createComponent;
var createNodeRange = $.nodeRange;
var emitUnmount = $.emitUnmount;
var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;
var getInjector = $.getInjector;
var hashCode = $.hashCode;
var insert = $.insert;
var isArray = $.isArray;
var setComponent = $.setComponent;
var setInjector = $.setInjector;
var throwError = $.throwError;
var toArray = $.toArray;

function createBlock(model, getView, container, injector) {
	var range = createNodeRange(true);
	var component = createComponent(function() {
		var view = getView(model);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(view);
		}
	}, container, injector);
	
	function render() {
		enqueueUpdate(component.render);
		
		return [
			range.start,
			range.end
		];
	}
	
	function insertBefore(end) {
		if (range.start.nextSibling) {
			range.insertBefore(end);
		} else {
			var prevComponent = getComponent(true);
			var prevInjector = getInjector(true);
			
			try {
				setComponent(component);
				setInjector(injector);
				insert(render(), end, end.parentNode, true);
			} catch (error) {
				throwError(error, component);
			} finally {
				setComponent(prevComponent);
				setInjector(prevInjector);
			}
		}
	}
	
	return {
		component: component,
		insertBefore: insertBefore,
		range: range,
		render: render
	};
}

function views(getView) {
	var signal = this;
	var container = getComponent();
	var injector = getInjector();
	var range = createNodeRange();
	var oldBlocks = {};
	var array = [];
	
	function render(models) {
		if (!isArray(models)) {
			models = toArray(models);
		}
		
		var newBlocks = {};
		var n = models.length;
		var newArray = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var model = models[i];
			var key = hashCode(model);
			
			while (key in newBlocks) {
				key = "_" + key;
			}
			
			newArray[i] = newBlocks[key] = oldBlocks[key] || createBlock(
				model,
				getView,
				container,
				injector
			);
		}
		
		for (var key in oldBlocks) {
			if (!(key in newBlocks)) {
				var block = oldBlocks[key];
				block.range.remove();
				emitUnmount(block.component);
			}
		}
		
		oldBlocks = newBlocks;
		
		if (range.start.nextSibling) {
			var m = array.length;
			var l = m;
			
			while (m > 0 && n > 0 && array[m - 1] === newArray[n - 1]) {
				--m;
				--n;
			}
			
			if (n === 0 && m === 0) {
				array = newArray;
				return;
			}
			
			var i = 0;
			var k = Math.min(m, n);
			var end = m < l ? array[m].range.start : range.end;
			
			while (i < k && array[i] === newArray[i]) {
				++i;
			}
			
			while (i < n) {
				newArray[i].insertBefore(end);
				++i;
			}
		}
		
		array = newArray;
	}
	
	signal.subscribe(render);
	
	enqueueUpdate(function() {
		render(signal.get());
	});
	
	return [
		range.start,
		range.end
	];
}

$.views = views;

})($);
