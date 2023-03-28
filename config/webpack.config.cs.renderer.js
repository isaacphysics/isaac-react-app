/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configAda = require('./webpack.config.cs');
const {merge} = require('webpack-merge');

module.exports = env => {
    let configAdaRenderer = {
        entry: {
            'ada-renderer': [resolve('src/index-ada-renderer')],
        },

        output: {
            path: resolve(`build-ada-renderer`),
        }
    };

    const nearly = merge(configAda({...env, isRenderer: true}), configAdaRenderer);

    nearly.entry = configAdaRenderer.entry;

    return nearly;
};
