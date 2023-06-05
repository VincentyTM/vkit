const {promises: fsp} = require("fs");
const {copyDirectory} = require("./server-libraries");

module.exports = async (wwwDir, templateWwwDir, handleError) => {
	if( templateWwwDir ){
		try{
			await copyDirectory(templateWwwDir, wwwDir);
		}catch(ex){
		}
	}else{
		await fsp.mkdir(wwwDir, {
			recursive: true
		});
	}
};
