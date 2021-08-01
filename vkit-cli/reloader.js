class Reloader {
	constructor(){
		this.requests = [];
	}
	subscribe(res){
		res.setHeader('content-type', 'text/plain; charset=utf-8');
		res.setHeader('content-length', '6');
		res.write('RE');
		this.requests.push(() => {
			res.end('LOAD');
		});
	}
	reload(){
		const requests = this.requests;
		for(const func of requests.splice(0, requests.length)){
			func();
		}
	}
}

module.exports = Reloader;
