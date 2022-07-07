/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configCS = require('./webpack.config.cs');
const {merge} = require('webpack-merge');
const webpack = require('webpack');

module.exports = env => {
    let configCSrenderer = {
        entry: {
            'isaac-cs-renderer': [resolve('src/index-cs-renderer')],
        },

        output: {
            path: resolve(`build-cs-renderer`),
        },

        plugins: [
            new webpack.DefinePlugin({
                EDITOR_PREVIEW: 'true',
            }),
        ]
    };

    const nearly = merge(configCS(env), configCSrenderer);

    nearly.entry = configCSrenderer.entry;

    return nearly;
};
