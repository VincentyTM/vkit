(function($){

var createState = $.state;
var render = $.render;
var unmount = $.unmount;

function createFileReader(input){
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
		render();
	};
	
	reader.onload = function(){
		output.set({
			result: reader.result
		});
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
	
	unmount(abort);
	
	return output.map();
}

$.fileReader = createFileReader;

})($);
