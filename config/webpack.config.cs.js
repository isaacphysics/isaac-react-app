/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const configCommon = require('./webpack.config.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const webpack = require('webpack');

module.exports = env => {

    let isProd = env === "prod";

    let configCS = {
        entry: {
            'isaac-cs': [resolve('src/index-cs')],
        },

        output: {
            path: resolve(`build-cs`),
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index-cs.html',
            }),
            new webpack.DefinePlugin({
                ISAAC_SITE: '"cs"',
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: resolve('public/manifest-cs.json'),
                    to: 'manifest-cs.json',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported-cs.html'),
                    to: 'unsupported_browser.html',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported-cs.js'),
                    to: 'unsupported_browser.js',
                }]
            }),
        ],
    };

    return merge(configCommon(isProd), configCS);
};
