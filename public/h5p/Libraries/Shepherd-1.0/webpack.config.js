const path =  require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {},
  output: {},
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(path.resolve(__dirname, 'node_modules'), 'tether', 'dist', 'js', 'tether.min.js'),
          to: path.join(path.resolve(__dirname, 'scripts'), 'tether.min.js')
        },
        {
          from: path.join(path.resolve(__dirname, 'node_modules'), 'tether', 'dist', 'css', 'tether.min.css'),
          to: path.join(path.resolve(__dirname, 'styles'), 'tether.min.css')
        },
        {
          from: path.join(path.resolve(__dirname, 'node_modules'), 'shepherd', 'dist', 'js', 'shepherd.min.js'),
          to: path.join(path.resolve(__dirname, 'scripts'), 'shepherd.min.js')
        },
        {
          from: path.join(path.resolve(__dirname, 'node_modules'), 'shepherd', 'dist', 'css', 'shepherd-theme-arrows.css'),
          to: path.join(path.resolve(__dirname, 'styles'), 'shepherd-theme-arrows.css')
        }
      ]
    })
  ]
} 
