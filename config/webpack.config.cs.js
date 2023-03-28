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
            'ada-cs': [resolve('src/index-ada')],
        },

        output: {
            path: resolve(`build-ada`),
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index-ada.html',
            }),
            new webpack.DefinePlugin({
                ISAAC_SITE: '"ada"',
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: resolve('public/manifest-ada.json'),
                    to: 'manifest-ada.json',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported-ada.html'),
                    to: 'unsupported_browser.html',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported-ada.js'),
                    to: 'unsupported_browser.js',
                }]
            }),
        ],
    };

    return merge(configCommon(env), configCS);
};
