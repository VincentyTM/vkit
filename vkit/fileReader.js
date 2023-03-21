(function($){

var createState = $.state;
var render = $.render;
var unmount = $.unmount;

function createFileReader(input, options){
	function abort(){
		reader.abort();
	}
	
	function update(value){
		abort();
		if( value ){
			output.set({
				progress: createState({
					lengthComputable: false,
					loaded: 0,
					total: 0
				}),
				abort: abort
			});
			switch(value.as){
				case "arrayBuffer": reader.readAsArrayBuffer(value.file); break;
				case "binaryString": reader.readAsBinaryString(value.file); break;
				case "dataURL": reader.readAsDataURL(value.file); break;
				case "text": reader.readAsText(value.file); break;
				default: reader.readAsText(value);
			}
		}else{
			output.set({});
		}
	}
	
	var output = createState();
	var reader = new FileReader();
	
	reader.onerror = function(){
		output.set({
			error: reader.error
		});
		if( typeof unsubscribe === "function" ){
			unsubscribe();
		}
		render();
	};
	
	reader.onload = function(){
		output.set({
			result: reader.result
		});
		if( typeof unsubscribe === "function" ){
			unsubscribe();
		}
		render();
	};
	
	reader.onprogress = function(e){
		output.get().progress.set(e);
		render();
	};
	
	if( input && typeof input.effect === "function" ){
		input.effect(update);
	}else{
		update(input);
	}
	
	var unsubscribe = options && typeof options.aborter === "function"
		? options.aborter(abort)
		: unmount(abort);
	
	return output.map();
}

$.fileReader = createFileReader;

})($);
