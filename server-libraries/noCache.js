module.exports = (res) => {
	res.setHeader("cache-control", "no-cache, no-store, no-transform, must-revalidate, proxy-revalidate, max-age=0");
	res.setHeader("pragma", "no-cache");
};
