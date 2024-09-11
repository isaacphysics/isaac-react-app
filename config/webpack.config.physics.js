/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const configCommon = require('./webpack.config.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const {codecovWebpackPlugin} = require("@codecov/webpack-plugin");

module.exports = env => {

    let configPhysics = {
        entry: {
            'isaac-phy': [resolve('src/index-phy')],
        },

        output: {
            path: resolve(`build-physics`),
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
                }
            ]}),
            // This one goes last:
            codecovWebpackPlugin({
                enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
                bundleName: 'web-phy',
                uploadToken: process.env.CODECOV_TOKEN,
                uploadOverrides: {
                    sha: process.env.GITHUB_COMMIT_SHA,
                }
            }),
        ],
    };

    return merge(configCommon(env), configPhysics);
};
