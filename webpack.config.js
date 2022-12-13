/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = ({ NODE_ENV }) => ({
  mode: NODE_ENV,
  target: 'node',
  context: __dirname,
  entry: './src/package/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin(fs.readFileSync(path.resolve(__dirname, './LICENSE'), 'utf8')),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.compile.json',
        },
      },
      { test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.(scss|css)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  externals: [
    {
      react: 'react',
    },
  ],
});
