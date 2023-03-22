/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

// Read in the .env file and put into `process.env`:
require('dotenv').config();

// Loader to remove test ids (only used in production builds)
const removeTestPropsLoader = {
    loader: "react-remove-props-loader",
    options: {
        props: ["data-testid", "data-test-id"]
    },
};

module.exports = (env) => {

    let isProd = env['prod'] ?? false;
    let isRenderer = env['isRenderer'] ?? false;

    return {
        stats: {
            errorDetails: true
        },

        mode: isProd ? "production" : "development",

        devServer: {
            headers: {
                "Content-Security-Policy-Report-Only": "default-src 'self' https://cdn.isaacphysics.org https://cdn.adacomputerscience.org localhost:8080 ws://localhost:8080 https://www.google-analytics.com https://maps.googleapis.com https://*.tile.openstreetmap.org; object-src 'none'; frame-src 'self' https://editor.isaaccode.org https://anvil.works https://*.anvil.app https://www.youtube-nocookie.com; img-src 'self' localhost:8080 data: https://cdn.isaacphysics.org https://cdn.adacomputerscience.org https://www.google-analytics.com https://i.ytimg.com https://maps.googleapis.com https://*.tile.openstreetmap.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://cdn.isaacphysics.org https://cdn.adacomputerscience.org https://fonts.gstatic.com;",
                "Feature-Policy": "geolocation 'none'; camera 'none'; microphone 'none'; accelerometer 'none';",
                "X-Clacks-Overhead": "GNU Terry Pratchett",
            },
            allowedHosts: "all"
        },

        output: {
            publicPath: "/",
            pathinfo: !isProd,
            filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
            chunkFilename: isProd ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
        },

        resolve: {
            modules: [path.resolve(__dirname), 'node_modules'],
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
            alias: {
                'p5': 'p5/lib/p5.min.js'
            },
            fallback: { "querystring": require.resolve("querystring-es3") }
        },

        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: /\.mjs$/,
                            include: /node_modules/,
                            type: 'javascript/auto'
                        },
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
                            ].concat(isProd ? [removeTestPropsLoader] : []),
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
                                isProd ? { loader: MiniCssExtractPlugin.loader, options: { esModule: false } } : null,
                                {
                                    loader: 'css-loader',
                                    options: {
                                        url: {
                                            filter: (url) => {
                                                // The "/assets" directory is a special case and should be ignored:
                                                return !url.startsWith("/assets");
                                            }
                                        }
                                    }
                                },
                                'sass-loader',
                            ].filter(Boolean),
                        },
                        {
                            test: /\.(png|gif|jpg|svg)$/,
                            type: 'asset/resource',
                            generator: {
                                filename: isProd ? 'static/assets/[name].[contenthash:8][ext]' : 'static/assets/[name][ext]',
                            }
                        },
                        {
                            test: /\.(ttf|woff2?|eot)$/,
                            type: 'asset/resource',
                            generator: {
                                filename: isProd ? 'static/fonts/[name].[contenthash:8][ext]' : 'static/fonts/[name][ext]',
                            }
                        }
                    ],
                },
            ],
        },

        optimization: {
            splitChunks: {
                chunks: "all",
            },
            runtimeChunk: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        safari10: true,
                    },
                }),
            ],
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
                ENV_QUIZ_FEATURE_FLAG: process.env.QUIZ_FEATURE && process.env.QUIZ_FEATURE.trim() === "true",
                EDITOR_PREVIEW: JSON.stringify(isRenderer)
            }),
        ].filter(Boolean),
    };
};
