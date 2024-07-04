/* eslint-disable */
const configAda = require('./webpack.config.ada');
const {merge} = require('webpack-merge');

module.exports = env => {
    let configAdaCypress = {
        cache: {type: 'filesystem', name: 'cs'},
    };

    return merge(configAda({...env, isRenderer: false, prod: false}), configAdaCypress);
};
