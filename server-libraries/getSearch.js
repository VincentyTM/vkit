module.exports = (req) => {
	const pos = req.url.indexOf("?");
	return pos === -1 ? "" : req.url.substring(pos);
};
