module.exports = (req) => {
	const pos = req.url.indexOf("?");
	return pos === -1 ? req.url : req.url.substring(0, pos);
};
