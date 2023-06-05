const CLI = require("./CLI");

module.exports = () => new CLI().start().catch(console.error);
