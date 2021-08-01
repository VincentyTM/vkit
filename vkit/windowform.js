(function($){

function tryUntilSuccess(callback, backoff){
	setTimeout(function(){
		try{
			callback();
		}catch(ex){
			tryUntilSuccess(callback, backoff*2);
		}
	}, backoff);
}

$.windowForm = function(){
	var win;
	function tryOrRegain(func, data1, data2, data3){
		try{
			win.access;
			func(data1, data2, data3);
		}catch(ex){
			tryUntilSuccess(function(){
				win.location.replace("about:blank");
				win.access;
				tryOrRegain(func, data1, data2, data3);
			}, 1);
		}
	}
	function get(url, callback){
		win.onunload = function(){
			setTimeout(callback, 0);
		};
		win.location.replace(url);
	}
	function post(url, data, callback){
		win.onunload = function(){
			setTimeout(callback, 0);
		};
		var doc = win.document;
		var form = doc.createElement("form");
		form.method = "POST";
		form.action = url;
		var submit = form.submit;
		if( data ){
			for(var name in data){
				var inp = doc.createElement("input");
				inp.type = "hidden";
				inp.name = name;
				inp.value = data[name];
				form.appendChild(inp);
			}
		}
		doc.body.appendChild(form);
		submit.call(form);
	}
	function close(_, callback){
		if( win ){
			win.onunload = function(){
				setTimeout(callback, 0);
			};
			win.close();
			win = null;
		}else{
			callback();
		}
	}
	return $.thenable({
		get: function(url){
			this.open();
			return this.then(function(_, resolve){
				tryOrRegain(get, url, resolve);
			});
		},
		post: function(url, data){
			this.open();
			return this.then(function(_, resolve){
				tryOrRegain(post, url, data, resolve);
			});
		},
		open: function(){
			if(!win || win.closed)
				win = window.open("", "", "channelmode=0,directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=0,titlebar=0,toolbar=0", true);
		},
		close: function(){
			return this.then(function(_, resolve){
				tryOrRegain(close, null, resolve);
			});
		}
	});
};

})($);
