import inject from "./inject.js";
import signal from "./signal.js";

export default function Dialogs() {
	if (!(this instanceof Dialogs)) {
		return inject(Dialogs);
	}
	
	var openDialogs = signal([]);
	
	function opener(component, only) {
		return function() {
			return open(component, arguments, only);
		};
	}
	
	function open(component, args, only) {
		var dialog = {
			render: function() {
				return component.apply(dialog, args);
			},
			close: function() {
				close(dialog);
			}
		};
		openDialogs.set(only ? [dialog] : openDialogs.get().concat([dialog]));
		return dialog;
	}
	
	function close(dialog) {
		var dialogs = openDialogs.get();
		
		for (var i = dialogs.length; i--;) {
			if (dialogs[i] === dialog) {
				openDialogs.set(dialogs.slice(0, i).concat(dialogs.slice(i + 1)));
				break;
			}
		}
	}
	
	function closeAll() {
		openDialogs.set([]);
	}
	
	function render() {
		return openDialogs.views(function(dialog) {
			return dialog;
		});
	}
	
	this.opener = opener;
	this.open = open;
	this.close = close;
	this.closeAll = closeAll;
	this.render = render;
}

Dialogs.opener = function(component, only) {
	return inject(Dialogs).opener(component, only);
};
