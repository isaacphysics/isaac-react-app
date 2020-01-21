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
                            test: /node_modules[\/\\](query-string|split-on-first|strict-uri-encode)[\/\\].*\.js$/,
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
            new CopyWebpackPlugin([{
               from: resolve('public/assets'),
               to: 'assets',
            }]),
            new webpack.DefinePlugin({
                REACT_APP_API_VERSION: `"${process.env.REACT_APP_API_VERSION}"`,
            }),
        ].filter(Boolean),
    };
};
