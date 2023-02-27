(function($){

var inject = $.inject;
var createState = $.state;

function Dialogs(){
	if(!(this instanceof Dialogs)){
		return inject(Dialogs);
	}
	var openDialogs = createState([]);
	
	function open(component, args){
		var dialog = {
			render: function(){
				return component.apply(dialog, args);
			},
			close: function(){
				close(dialog);
			}
		};
		openDialogs.set(openDialogs.get().concat([dialog]));
		return dialog;
	}
	
	function close(dialog){
		var dialogs = openDialogs.get();
		for(var i=dialogs.length; i--;){
			if( dialogs[i] === dialog ){
				openDialogs.set(dialogs.slice(0, i).concat(dialogs.slice(i + 1)));
				break;
			}
		}
	}
	
	function render(){
		return openDialogs.views(function(dialog){
			return dialog;
		});
	}
	
	this.open = open;
	this.close = close;
	this.render = render;
}

Dialogs.opener = function(component){
	var dialogs = inject(Dialogs);
	
	return function(){
		return dialogs.open(component, arguments);
	};
};

$.dialogs = Dialogs;

})($);
