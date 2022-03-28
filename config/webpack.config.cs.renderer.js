/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configCS = require('./webpack.config.cs');
const merge = require('webpack-merge');

module.exports = env => {

    let isProd = env === "prod";

    let configCSrenderer = {
        entry: {
            'isaac-cs-renderer': [resolve('src/index-cs-renderer')],
        },

        output: {
            path: resolve(`build-cs-renderer`),
        },
    };

    const nearly = merge(configCS(isProd), configCSrenderer);

    nearly.entry = configCSrenderer.entry;

    return nearly;
};
