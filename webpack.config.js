// @ts-check
import path from "path";

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: "./src/components/Swiper.tsx",
  output: {
    path: path.resolve(process.cwd(), "dist"),
    filename: "Swiper.js",
    library: "React Swiper",
    libraryTarget: "umd",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
  },
};

export default config;
