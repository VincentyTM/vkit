(function($){

var createThread = $.thread;

function recorderTask(sampleRate){
	var recLength, recBuffersL, recBuffersR;
	
	this.record = function(inputBufferL, inputBufferR){
		recBuffersL.push(inputBufferL);
		recBuffersR.push(inputBufferR);
		recLength += inputBufferL.length;
	};
	
	this.exportWAV = function(){
		var bufferL = mergeBuffers(recBuffersL, recLength);
		var bufferR = mergeBuffers(recBuffersR, recLength);
		var interleaved = interleave(bufferL, bufferR);
		var dataview = encodeWAV(interleaved);
		var audioBlob = new Blob([dataview], {type: "audio/wav"});
		return audioBlob;
	};
	
	this.getBuffers = function(){
		this.postMessage([
			mergeBuffers(recBuffersL, recLength),
			mergeBuffers(recBuffersR, recLength)
		]);
	};
	
	this.clear = function(){
		recLength = 0;
		recBuffersL = [];
		recBuffersR = [];
	};
	
	function mergeBuffers(recBuffers, recLength){
		var result = new Float32Array(recLength);
		var offset = 0;
		var n = recBuffers.length;
		for(var i=0; i<n; ++i){
			result.set(recBuffers[i], offset);
			offset += recBuffers[i].length;
		}
		return result;
	}
	
	function interleave(inputL, inputR){
		var length = inputL.length + inputR.length;
		var result = new Float32Array(length);
		var index = 0;
		var inputIndex = 0;
		while( index < length ){
			result[index++] = inputL[inputIndex];
			result[index++] = inputR[inputIndex];
			++inputIndex;
		}
		return result;
	}
	
	function floatTo16BitPCM(output, offset, input){
		var n = input.length;
		for(var i=0; i<n; ++i, offset+=2){
			var s = Math.max(-1, Math.min(1, input[i]));
			output.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
		}
	}
	
	function writeString(view, offset, string){
		var n = string.length;
		for(var i=0; i<n; ++i){
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}
	
	function encodeWAV(samples, mono){
		var buffer = new ArrayBuffer(44 + samples.length * 2);
		var view = new DataView(buffer);
		writeString(view, 0, "RIFF");
		view.setUint32(4, 32 + samples.length * 2, true);
		writeString(view, 8, "WAVE");
		writeString(view, 12, "fmt ");
		view.setUint32(16, 16, true);
		view.setUint16(20, 1, true);
		view.setUint16(22, mono ? 1 : 2, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, sampleRate * 4, true);
		view.setUint16(32, 4, true);
		view.setUint16(34, 16, true);
		writeString(view, 36, "data");
		view.setUint32(40, samples.length * 2, true);
		floatTo16BitPCM(view, 44, samples);
		return view;
	}
	
	this.clear();
}

function createAudioRecorder(source){
	var context = source.context;
	var recorder = createThread();
	
	recorder.task(recorderTask)(context.sampleRate);
	
	var record = recorder.task(function(L, R){
		record(L, R);
	});
	
	var bufferLength = 4096;
	var recording = false;
	var node = context.createScriptProcessor
		? context.createScriptProcessor(bufferLength, 2, 2)
		: context.createJavaScriptNode(bufferLength, 2, 2);
	
	node.onaudioprocess = function(e){
		recording && record(
			e.inputBuffer.getChannelData(0),
			e.inputBuffer.getChannelData(1)
		);
	};
	
	source.connect(node);
	node.connect(context.destination);
	
	return {
		destroy: function(){
			try{ source.disconnect(node); }catch(ex){}
			try{ node.disconnect(context.destination); }catch(ex){}
			recorder.stop();
		},
		start: function(){
			recording = true;
		},
		stop: function(){
			recording = false;
		},
		clear: recorder.task(function(){
			clear();
		}),
		exportWAV: recorder.task(function(){
			return exportWAV();
		}),
		getBuffers: recorder.task(function(){
			return getBuffers();
		})
	};
}

$.audioRecorder = createAudioRecorder;

})($);
