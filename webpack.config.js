// @ts-check
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  target: 'node',
  entry: './src/Swiper.tsx',
  context: __dirname,
  node: {
    global: true,
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Swiper.js',
    library: 'ReactSwiper',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
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
        test: /\.module\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
    },
  },
  externals: {
    react: 'react',
  },
};

module.exports = config;
