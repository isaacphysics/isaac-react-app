/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configPhy = require('./webpack.config.physics');
const {merge} = require('webpack-merge');

module.exports = env => {
    let configPhyCypress = {
        cache: {type: 'filesystem', name: 'phy'}
    };

    return merge(configPhy({...env, isRenderer: false, prod: false}), configPhyCypress);
};
