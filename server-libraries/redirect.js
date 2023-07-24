module.exports = (res, url) => {
	res.writeHead(302, {"location": url}).end();
};
