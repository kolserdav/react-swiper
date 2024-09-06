// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        test: /\.(scss|css)$/i,
        use: ['css-loader'],
      },
    ],
  },
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

export default config;
