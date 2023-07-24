const {promises: fsp} = require("fs");
const {copyDirectory} = require("../server-libraries");

module.exports = async (srcDir, templateSrcDir = null) => {
	if( templateSrcDir ){
		try{
			await copyDirectory(templateSrcDir, srcDir);
		}catch(ex){
		}
	}else{
		await fsp.mkdir(srcDir, {
			recursive: true
		});
	}
};
