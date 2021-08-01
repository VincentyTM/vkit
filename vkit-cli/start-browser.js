const childProcess = require("child_process");

function startBrowser(url){
	var start = (process.platform == 'darwin' ? 'open': process.platform == 'win32' ? 'start': 'xdg-open');
	childProcess.exec(start + ' ' + url);
}

module.exports = startBrowser;
