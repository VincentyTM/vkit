var emptyComponent = function(){
	return null;
};

function preload(promise, pendingComponent, errorComponent){
	return pendingComponent || emptyComponent;
}

module.exports = preload;
