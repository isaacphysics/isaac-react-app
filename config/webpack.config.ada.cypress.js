/* eslint-disable */
const path = require('path');
const BASE_DIRECTORY = path.resolve(__dirname, "..");
const resolve = (p) => path.resolve(BASE_DIRECTORY, p);
const configAda = require('./webpack.config.ada');
const {merge} = require('webpack-merge');

module.exports = env => {
    let configAdaCypress = {
        cache: {type: 'filesystem', name: 'cs'},
    };

    return merge(configAda({...env, isRenderer: false, prod: false}), configAdaCypress);
};
