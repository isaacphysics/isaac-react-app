/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configPHY = require('./webpack.config.physics');
const {merge} = require('webpack-merge');
const webpack = require('webpack');

module.exports = env => {

    let configPHYrenderer = {
        entry: {
            'isaac-phy-renderer': [resolve('src/index-phy-renderer')],
        },

        output: {
            path: resolve(`build-phy-renderer`),
        },

        plugins: [
            new webpack.DefinePlugin({
                EDITOR_PREVIEW: 'true',
            }),
        ]
    };

    const nearly = merge(configPHY(env), configPHYrenderer);

    nearly.entry = configPHYrenderer.entry;

    return nearly;
};
