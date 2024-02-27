const comparePaths = (x, y) => y.split("/").length - x.split("/").length || x.localeCompare(y);

export default comparePaths;
