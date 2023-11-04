var createObservable = require("./observable");
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function createAsset(name) {
	var refCount = 1;
	var unload = createObservable();
	var errorHandler = createObservable();
	var loadHandler = createObservable();
	var progressHandler = createObservable();
	var resetHandler = createObservable();
	var status = PENDING;
	var data;
	
	function addRef() {
		++refCount;
	}
	
	function removeRef() {
		var doUnload = --refCount <= 0;
		
		if (doUnload) {
			reset();
			unload();
			unload.clear();
		}
		
		return doUnload;
	}
	
	function load(value) {
		if (status === PENDING) {
			status = FULFILLED;
			data = value;
			loadHandler(value);
		}
	}
	
	function error(reason) {
		if (status === PENDING) {
			status = REJECTED;
			data = reason;
			errorHandler(reason);
		}
	}
	
	function progress(state) {
		if (status === PENDING) {
			progressHandler(state);
		}
	}
	
	function reset() {
		if (status !== PENDING) {
			status = PENDING;
			data = undefined;
			resetHandler();
		}
	}
	
	function getValue() {
		return status === FULFILLED ? data : undefined;
	}
	
	function isFulfilled() {
		return status === FULFILLED;
	}
	
	function isPending() {
		return status === PENDING;
	}
	
	function isRejected() {
		return status === REJECTED;
	}
	
	function then(resolveHandler, rejectHandler) {
		var unsub = createObservable();
		
		if (typeof resolveHandler === "function") {
			if (status === FULFILLED) {
				resolveHandler(data);
			} else if (status === PENDING) {
				unsub.subscribe(
					loadHandler.subscribe(function(value) {
						unsub();
						resolveHandler(value);
					})
				);
			}
		}
		
		if (typeof rejectHandler === "function") {
			if (status === REJECTED) {
				rejectHandler(data);
			} else if (status === PENDING) {
				unsub.subscribe(
					errorHandler.subscribe(function(reason) {
						unsub();
						rejectHandler(reason);
					})
				);
			}
		}
	}
	
	return {
		addRef: addRef,
		publicInterface: {
			error: error,
			get: getValue,
			isFulfilled: isFulfilled,
			isPending: isPending,
			isRejected: isRejected,
			load: load,
			name: name,
			onError: errorHandler.subscribe,
			onLoad: loadHandler.subscribe,
			onProgress: progressHandler.subscribe,
			onReset: resetHandler.subscribe,
			onUnload: unload.subscribe,
			progress: progress,
			reset: reset,
			then: then
		},
		removeRef: removeRef,
		unload: unload
	};
}

function createAssetContainer(assetNeeded) {
	var assets = {};
	
	function addAsset(name) {
		var asset = assets[name];
		
		if (asset) {
			asset.addRef();
		} else {
			asset = assets[name] = createAsset(name);
			
			if (typeof assetNeeded === "function") {
				try {
					assetNeeded(asset.publicInterface);
				} catch (ex) {
					asset.error(ex);
				}
			}
		}
		
		return asset;
	}
	
	function removeAsset(name) {
		var asset = assets[name];
		
		if (asset && asset.removeRef()) {
			delete assets[name];
		}
	}
	
	function createRefs() {
		var refs = {};
		
		function add(name) {
			var asset = refs[name];
			
			if (asset) {
				return asset.publicInterface;
			}
			
			refs[name] = asset = addAsset(name);
			return asset.publicInterface;
		}
		
		function forEach(callback) {
			for (var name in refs) {
				callback(refs[name].publicInterface);
			}
		}
		
		function get(name) {
			var asset = refs[name];
			return asset ? asset.publicInterface.get() : undefined;
		}
		
		function has(name) {
			return name in refs;
		}
		
		function remove(name) {
			if (refs[name]) {
				delete refs[name];
				removeAsset(name);
			}
		}
		
		function removeAll() {
			for (var name in refs) {
				remove(name);
			}
		}
		
		function set(name, value) {
			var asset = add(name);
			asset.reset();
			asset.load(value);
		}
		
		return {
			add: add,
			forEach: forEach,
			get: get,
			has: has,
			remove: remove,
			removeAll: removeAll,
			set: set
		};
	}
	
	function bind(destination, loadHandler, unloadHandler) {
		var name = destination.name;
		var asset = addAsset(name);
		
		destination.onUnload(
			asset.publicInterface.onLoad(loadHandler)
		);
		
		destination.onUnload(
			asset.publicInterface.onError(destination.error)
		);
		
		destination.onUnload(
			asset.publicInterface.onReset(destination.reset)
		);
		
		if (asset.publicInterface.isFulfilled()) {
			loadHandler(asset.publicInterface.get());
		}
		
		destination.onUnload(function() {
			removeAsset(name);
		});
		
		if (typeof unloadHandler === "function") {
			destination.onUnload(
				asset.publicInterface.onUnload(unloadHandler)
			);
		}
	}
	
	function forEach(callback) {
		for (var name in assets) {
			callback(assets[name].publicInterface);
		}
	}
	
	function select(name) {
		var asset = assets[name];
		return asset ? asset.publicInterface : undefined;
	}
	
	return {
		bind: bind,
		forEach: forEach,
		refs: createRefs,
		select: select
	};
}

module.exports = createAssetContainer;
