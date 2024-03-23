var Container = typeof WeakMap === "function" ? WeakMap : function() {
	var array = [];
	
	this.get = function(key) {
		for (var i = array.length - 2; i >= 0; i -= 2) {
			if (array[i] === key) {
				return array[i + 1];
			}
		}
		return undefined;
	};
	
	this.set = function(key, value) {
		for (var i = array.length - 2; i >= 0; i -= 2) {
			if (array[i] === key) {
				array[i + 1] = value;
				return;
			}
		}
		array.push(key, value);
	};
};

export default function createInjector(parent, handleMissingProvider) {
	return {
		container: new Container(),
		handleMissingProvider: handleMissingProvider,
		parent: parent
	};
}
