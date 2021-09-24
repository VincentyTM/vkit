class Reloader {
	constructor(){
		this.requests = [];
	}
	subscribe(res){
		res.setHeader('content-type', 'text/plain; charset=utf-8');
		res.write('reload');
		this.requests.push(resources => {
			res.end(resources ? ":" + resources.join(":") : "");
		});
	}
	reload(data){
		const requests = this.requests;
		for(const func of requests.splice(0, requests.length)){
			func(data);
		}
	}
}

module.exports = Reloader;
