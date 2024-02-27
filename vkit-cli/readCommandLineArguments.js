import process from "process";

const readCommandLineArguments = async (processArgument) => {
	const args = process.argv.slice(2);
	let i = 0;
	
	for (const arg of args) {
		const regexp = /^--[a-zA-Z][a-zA-Z0-9]*/g;
		const match = regexp.exec(arg);
		
		if (match) {
			const key = match[0].substring(2);
			const i = regexp.lastIndex;
			
			if (arg[i] === "=") {
				await processArgument(key, decodeURIComponent(arg.substring(i + 1)));
			} else {
				await processArgument(key, true);
			}
		} else {
			await processArgument(null, args.slice(i).join(" "));
			break;
		}
		
		++i;
	}
}

export default readCommandLineArguments;
