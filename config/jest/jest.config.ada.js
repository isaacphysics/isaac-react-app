/* eslint-disable */
let config = require("./jest.config.common");

config.globals.ISAAC_SITE = "ada";
config.workerIdleMemoryLimit = '512MB';
config.testTimeout = 20000;

module.exports = config;
