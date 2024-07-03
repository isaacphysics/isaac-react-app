/* eslint-disable */
const path = require('path');
const configPhy = require('./webpack.config.physics');
const {merge} = require('webpack-merge');

module.exports = env => {
    let configPhyCypress = {
        cache: {type: 'filesystem', name: 'phy'}
    };

    return merge(configPhy({...env, isRenderer: false, prod: false}), configPhyCypress);
};
