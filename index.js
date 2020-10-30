var requireDir = require("require-dir");
var commandsFn = requireDir("lib");

module.exports = Object.keys(commandsFn).map(i => commandsFn[i]());
