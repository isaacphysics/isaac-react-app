/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configPHY = require('./webpack.config.physics');
const merge = require('webpack-merge');

module.exports = env => {

    let isProd = env['prod'];

    let configPHYrenderer = {
        entry: {
            'isaac-phy-renderer': [resolve('src/index-phy-renderer')],
        },

        output: {
            path: resolve(`build-phy-renderer`),
        },
    };

    const nearly = merge(configPHY(isProd), configPHYrenderer);

    nearly.entry = configPHYrenderer.entry;

    return nearly;
};
