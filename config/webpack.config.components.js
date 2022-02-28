/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const configCommon = require('./webpack.config.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = env => {

    let isProd = env === "prod";

    let configCS = {
        entry: resolve('src/index-components'),


        output: {
            path: resolve(`build-components`),
            filename: "index-components.js",
            library: 'isaac-components',
            libraryTarget: 'umd',
            //filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
            //chunkFilename: "isaac-components.chunk.js",
        },

        externals: {
            // Use external version of React
            "react": {
                "commonjs": "react",
                "commonjs2": "react",
                "amd": "react",
                "root": "React"
            },
            "react-dom": {
                "commonjs": "react-dom",
                "commonjs2": "react-dom",
                "amd": "react-dom",
                "root": "ReactDOM"
            }
        },

        plugins: [
            /*new HtmlWebpackPlugin({
                template: 'public/index-cs.html',
            }),*/
            new webpack.DefinePlugin({
                ISAAC_SITE: '"cs"',
            }),
            /*new CopyWebpackPlugin({
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
            }),*/
        ],

        optimization: {
            splitChunks: false,
            runtimeChunk: false,
        },
    };

    const finalConfig = merge(configCommon(isProd), configCS);
    //console.log("finalConfig", finalConfig, JSON.stringify(finalConfig, null, 4));
    return finalConfig;
};
