(function($){

function recorderTask(sampleRate){
	var recLength, recBuffersL, recBuffersR;
	this.record=function(inputBufferL, inputBufferR){
		recBuffersL.push(inputBufferL);
		recBuffersR.push(inputBufferR);
		recLength+=inputBufferL.length;
	};
	this.exportWAV=function(){
		var bufferL=mergeBuffers(recBuffersL, recLength);
		var bufferR=mergeBuffers(recBuffersR, recLength);
		var interleaved=interleave(bufferL, bufferR);
		var dataview=encodeWAV(interleaved);
		var audioBlob=new Blob([dataview], {type:"audio/wav"});
		return audioBlob;
	};
	this.getBuffers=function(){
		this.postMessage([
			mergeBuffers(recBuffersL, recLength),
			mergeBuffers(recBuffersR, recLength)
		]);
	};
	this.clear=function(){
		recLength=0;
		recBuffersL=[];
		recBuffersR=[];
	};
	function mergeBuffers(recBuffers, recLength){
		var result=new Float32Array(recLength);
		var offset=0;
		for(var i=0; i<recBuffers.length; ++i){
			result.set(recBuffers[i], offset);
			offset+=recBuffers[i].length;
		}
		return result;
	}
	function interleave(inputL, inputR){
		var length=inputL.length + inputR.length;
		var result=new Float32Array(length);
		var index=0, inputIndex=0;
		while( index<length ){
			result[index++]=inputL[inputIndex];
			result[index++]=inputR[inputIndex];
			++inputIndex;
		}
		return result;
	}
	function floatTo16BitPCM(output, offset, input){
		for(var i=0; i<input.length; ++i, offset+=2){
			var s=Math.max(-1, Math.min(1, input[i]));
			output.setInt16(offset, s<0 ? s*32768 : s*32767, true);
		}
	}
	function writeString(view, offset, string){
		for(var i=0; i<string.length; ++i){
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}
	function encodeWAV(samples, mono){
		var buffer=new ArrayBuffer(44 + samples.length*2);
		var view=new DataView(buffer);
		writeString(view, 0, "RIFF");
		view.setUint32(4, 32 + samples.length*2, true);
		writeString(view, 8, "WAVE");
		writeString(view, 12, "fmt ");
		view.setUint32(16, 16, true);
		view.setUint16(20, 1, true);
		view.setUint16(22, mono?1:2, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, sampleRate*4, true);
		view.setUint16(32, 4, true);
		view.setUint16(34, 16, true);
		writeString(view, 36, "data");
		view.setUint32(40, samples.length*2, true);
		floatTo16BitPCM(view, 44, samples);
		return view;
	}
	this.clear();
}

function Recorder(source){
	var context=source.context;
	var recorder = $.thread();
	recorder.task(recorderTask)(context.sampleRate);
	var record=recorder.task(function(L, R){
		record(L, R);
	});
	var bufferLen=4096;
	var recording=false;
	this.start=function(){
		recording=true;
		return this;
	};
	this.stop=function(){
		recording=false;
		return this;
	};
	this.clear=recorder.task(function(){
		clear();
	});
	this.getBuffers=recorder.task(function(){
		return getBuffers();
	});
	this.exportWAV=recorder.task(function(){
		return exportWAV();
	});
	this.destroy=function(){
		source.disconnect(node);
		recorder.stop();
	};
	var node=context.createScriptProcessor ? context.createScriptProcessor(bufferLen, 2, 2) : context.createJavaScriptNode(bufferLen, 2, 2);
	node.onaudioprocess=function(e){
		recording && record(
			e.inputBuffer.getChannelData(0),
			e.inputBuffer.getChannelData(1)
		);
	};
	source.connect(node);
	node.connect(context.destination);
}

$.recorder=function(source){
	return new Recorder(source);
};

})($);
