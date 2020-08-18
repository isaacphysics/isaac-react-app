/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

// Read in the .env file and put into `process.env`:
require('dotenv').config();

module.exports = (isProd) => {

    return {
        mode: isProd ? "production" : "development",

        devServer: {
            headers: {
                "Content-Security-Policy-Report-Only": "default-src 'self' https://cdn.isaacphysics.org https://cdn.isaaccomputerscience.org localhost:8080 https://www.google-analytics.com https://maps.googleapis.com; object-src 'none'; frame-src 'self' https://anvil.works https://*.anvil.app https://www.youtube-nocookie.com; img-src 'self' localhost:8080 data: https://cdn.isaacphysics.org https://cdn.isaaccomputerscience.org https://www.google-analytics.com https://i.ytimg.com https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://cdn.isaacphysics.org https://cdn.isaaccomputerscience.org https://fonts.gstatic.com;",
                "Feature-Policy": "geolocation 'none'; camera 'none'; microphone 'none'; accelerometer 'none';",
                "X-Clacks-Overhead": "GNU Terry Pratchett",
            },
        },

        output: {
            publicPath: "/",
            pathinfo: !isProd,
            filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
            chunkFilename: isProd ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
        },

        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },

        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: /\.[jt]sx?$/,
                            exclude: /node_modules/,
                            use: [
                                {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: ["@babel/preset-env", "@babel/preset-react"],
                                        plugins: [
                                          "@babel/plugin-proposal-class-properties",
                                          "@babel/plugin-transform-classes"
                                        ]
                                    }
                                },
                                {
                                loader: 'ts-loader',
                                options: {
                                    compilerOptions: {
                                        noEmit: false,
                                        jsx: "react",
                                    },
                                },
                                }
                            ],
                        },
                        {
                            test: /node_modules[\/\\](query-string|split-on-first|strict-uri-encode|d3.*)[\/\\].*\.js$/,
                            use: [
                                {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: ["@babel/preset-env"],
                                        plugins: ["@babel/plugin-transform-modules-commonjs"]
                                    }
                                },
                            ],
                        },
                        {
                            test: /\.scss$/,
                            use: [
                                'style-loader',
                                isProd ? MiniCssExtractPlugin.loader : null,
                                'css-loader',
                                'sass-loader',
                            ].filter(Boolean),
                        },
                        {
                            include: [/\.ttf$/, /\.woff2?$/,],
                            use: {
                                loader: 'file-loader',
                                options: {
                                    name: isProd ? 'static/fonts/[name].[contenthash:8].[ext]' : 'static/fonts/[name].[ext]',
                                },
                            },
                        },
                    ],
                },
            ],
        },

        optimization: {
            splitChunks: {
                chunks: "all",
            },
            runtimeChunk: true,
        },

        devtool : "source-map",

        plugins: [
            isProd ? new CleanWebpackPlugin() : null, // Clear the build directory before writing output of a successful build.
            new MiniCssExtractPlugin({
                filename: isProd ? 'static/css/[name].[contenthash:8].css' : 'static/css/[name].css',
                chunkFilename: isProd ? 'static/css/[name].[contenthash:8].chunk.css' : 'static/css/[name].chunk.css',
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: resolve('public/assets'),
                    to: 'assets',
                }
            ]}),
            new webpack.DefinePlugin({
                REACT_APP_API_VERSION: `"${process.env.REACT_APP_API_VERSION}"`,
            }),
        ].filter(Boolean),
    };
};
