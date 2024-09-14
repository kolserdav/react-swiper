// @ts-check
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { writeFileSync } = require('fs');

const disDirPath = path.resolve(__dirname, 'dist');

/**
 * @param {{WEBPACK_BUILD?: boolean}} param0
 * @param {import('webpack').Configuration} argv
 * @returns {import('webpack').Configuration}
 */
const config = ({ WEBPACK_BUILD }, argv) => ({
  mode: WEBPACK_BUILD ? 'production' : 'development',
  target: 'web',
  entry: './src/Swiper.tsx',
  context: __dirname,
  node: {
    global: true,
  },
  devtool: 'source-map',
  output: {
    path: disDirPath,
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
    extensions: ['.tsx', '.ts', '.js', '.css'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
    },
  },
  externals: {
    react: 'react',
  },
});

module.exports = config;
