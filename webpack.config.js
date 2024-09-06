// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: './src/components/Swiper.tsx',
  context: __dirname,
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'Swiper.js',
    library: 'ReactSwiper',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
    'react-dom': 'react-dom',
  },
};

export default config;
