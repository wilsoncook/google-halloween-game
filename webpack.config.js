var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// var phaserModule = path.join(__dirname, '/node_modules/phaser/'),
//   phaser = path.join(phaserModule, 'build/custom/phaser-split.js'),
//   pixi = path.join(phaserModule, 'build/custom/pixi.js'),
//   p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  entry: './src/index.ts',
  output: {
    pathinfo: true,
    path: path.resolve('./dist'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: './src/assets',
      to: './assets'
    }]),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body'
    }),
    // new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      // { test: /pixi\.js/, loader: 'expose?PIXI' },
      // { test: /phaser-split\.js$/, loader: 'expose?Phaser' },
      // { test: /p2\.js/, loader: 'expose?p2' },
      { test: /\.ts?$/, loader: 'ts', exclude: '/node_modules' }
    ]
  },
  resolve: {
    extensions: ['', '.webpack.js', '.js', '.ts'],
    // alias: {
    //   'phaser': phaser,
    //   'pixi': pixi,
    //   'p2': p2
    // }
  },
  devtool: 'source-map'
};