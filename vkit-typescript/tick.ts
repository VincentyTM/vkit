var ticks: (() => void)[] = [];

function tick(callback: () => void){
	ticks.push(callback);
}

function callTicks(){
	var n = ticks.length;
	
	if( n ){
		var callbacks = ticks;
		
		ticks = [];
		
		for(var i=0; i<n; ++i){
			callbacks[i]();
		}
	}
}

export { callTicks };

export default tick;
