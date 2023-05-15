/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configCS = require('./webpack.config.cs');
const {merge} = require('webpack-merge');

module.exports = env => {
    let configCSrenderer = {
        entry: {
            'isaac-renderer': [resolve('src/index-renderer')],
        },

        output: {
            path: resolve(`build-renderer`),
        }
    };

    const nearly = merge(configCS({...env, isRenderer: true}), configCSrenderer);

    nearly.entry = configCSrenderer.entry;

    return nearly;
};
