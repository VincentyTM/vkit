const process = require("process");

module.exports = ({
	exportApp,
	loadConfig,
	output,
	rebuild,
	reload,
	startBrowser
}) => {
	process.stdin.resume();
	process.stdin.on("data", (data) => {
		const cmd = data
			.toString()
			.replace(/\r|\n/g, "")
			.split(" ");
		
		switch( cmd[0] ){
			case "build": rebuild(); break;
			case "config": loadConfig(); break;
			case "exit": process.exit(); break;
			case "export": exportApp(); break;
			case "help":
				output.showHelp();
				return;
			case "reload": reload(); break;
			case "start": startBrowser(); break;
			default:
				output.unknownCommand(cmd[0]);
				return;
		}
		
		output.reset();
	});
};
