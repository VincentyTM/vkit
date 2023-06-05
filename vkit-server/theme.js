var inject = require("./inject.js").inject;

function Theme(props){
	if(!(this instanceof Theme)){
		if( typeof props === "string" ){
			return inject(Theme).props[props];
		}
		return function(){
			var theme = inject(Theme);
			for(var name in props){
				if( theme.props[name] ){
					theme.props[name].push(props[name]);
				}else{
					theme.props[name] = [props[name]];
				}
			}
		};
	}
	this.props = {};
}

module.exports = Theme;
