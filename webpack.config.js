'use strict';

var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/entry.js',

  output: {
    path: path.join(__dirname, './dist/'),
    filename: 'js/bundle.js',
  },

  plugins: [
    new webpack.DefinePlugin({
      ENV: JSON.stringify('development'),
    }),
  ],
}
