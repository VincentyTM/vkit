module.exports = ({
	apiPath,
	indexPath,
	reloadMethod = "POST",
	reloadPath = "reload"
}) => `<script type="text/javascript" language="javascript">
"use strict";
(function(document){
	var unloaded = false;
	
	function unload(){
		unloaded = true;
	}
	
	if( window.addEventListener ){
		window.addEventListener("beforeunload", unload, false);
	}else if( window.attachEvent ){
		window.attachEvent("onbeforeunload", unload);
	}
	
	function applyStyle(src, version){
		var stylesheets = document.styleSheets;
		
		for(var i=stylesheets.length; i--;){
			var href = stylesheets[i].href;
			
			if(!href){
				continue;
			}
			
			var pos = href.indexOf("?");
			
			if(~pos){
				href = href.substring(0, pos);
			}
			
			href = href.replace(location.origin, "");
			
			if( href.charAt(0) !== "/" ){
				href = "/" + href;
			}
			
			if( href === src ){
				var node = stylesheets[i].ownerNode;
				
				if( version ){
					var srcWithVersion = src + "?v=" + version;
					
					if( href !== srcWithVersion ){
						node.href = srcWithVersion;
					}
				}else{
					var parent = node.parentNode;
					if( parent ){
						parent.removeChild(node);
					}
				}
				
				return true;
			}
		}
		
		return false;
	}
	
	function updateStylesheets(parts){
		var n = parts.length;
		
		if( n % 2 !== 0 ){
			return;
		}
		
		for(var i=0; i<n; i+=2){
			if(!applyStyle(parts[i], parts[i+1])){
				reloadPage();
			}
		}
	}
	
	function reloadPage(){
		if( unloaded ){
			return;
		}
		
		unload();
		
		if( location.pathname === "${indexPath}" ){
			location.reload();
		}else{
			location.replace("${indexPath}" + location.hash);
		}
	}
	
	function watchReload(){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if( xhr.readyState === 0 || xhr.readyState === 4 ){
				xhr.onreadystatechange = null;
				
				if( unloaded ){
					return;
				}
				
				if( xhr.status === 200 ){
					if( xhr.responseText ){
						updateStylesheets(xhr.responseText.split("\\n"));
					}else{
						reloadPage();
					}
				}
				
				watchReload();
			}
		};
		xhr.open("${reloadMethod}", "${apiPath}${reloadPath}", true);
		xhr.responseType = "text";
		xhr.send();
	}
	
	setTimeout(watchReload, 0);
})(document);
</script>`;
