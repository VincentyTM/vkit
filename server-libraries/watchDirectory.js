const fs = require("fs");

function watchDirectory(directory, callback, handleError) {
	let watch = null;
	
	try {
		watch = fs.watch(directory, {recursive: true}, async (eventType, filename) => {
			try {
				await callback(directory + "/" + filename.split("\\").join("/"), eventType);
			} catch (ex) {
				handleError(ex);
			}
		}).on("error", handleError);
	} catch (ex) {
		handleError(ex);
	}
	
	return {
		close() {
			if (watch) {
				watch.close();
				watch = null;
			}
		}
	};
}

module.exports = watchDirectory;
