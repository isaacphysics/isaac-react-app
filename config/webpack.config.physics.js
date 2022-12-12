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

    let configPhysics = {
        entry: {
            'isaac-phy': [resolve('src/index-phy')],
        },

        output: {
            path: resolve(`build-phy`),
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index-phy.html',
            }),
            new webpack.DefinePlugin({
               ISAAC_SITE: '"physics"',
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: resolve('public/manifest-phy.json'),
                    to: 'manifest-phy.json',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported-phy.html'),
                    to: 'unsupported_browser.html',
                }, {
                    from: resolve('public/unsupported_browsers/unsupported-phy.js'),
                    to: 'unsupported_browser.js',
                }
            ]}),
        ],
    };

    return merge(configCommon(env), configPhysics);
};
