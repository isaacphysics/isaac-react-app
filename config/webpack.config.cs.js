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

    let configCS = {
        entry: {
            'isaac-cs': [resolve('src/index')],
        },

        output: {
            path: resolve(`build`),
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index.html',
            }),
            new webpack.DefinePlugin({
                ISAAC_SITE: '"cs"',
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: resolve('public/manifest.json'),
                    to: 'manifest.json',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported.html'),
                    to: 'unsupported_browser.html',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported.js'),
                    to: 'unsupported_browser.js',
                }]
            }),
        ],
    };

    return merge(configCommon(env), configCS);
};
