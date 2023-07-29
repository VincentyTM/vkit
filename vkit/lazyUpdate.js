(function($){

var enqueueUpdate = $.enqueueUpdate;

function createLazyUpdate(callback){
	var enqueued = false;

	function update(){
		if(!enqueued){
			enqueued = true;
			enqueueUpdate(realUpdate);
		}
	}

	function realUpdate(){
		enqueued = false;
		callback();
	}

	return update;
};

$.lazyUpdate = createLazyUpdate;

})($);
