//webpack.config.js
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "production",
  devServer: {
    contentBase: './dist',
  },
  entry: "./index.ts",
  module: {
    rules: [
      {
        test: /\.(css|html)$/i,
        use: 'raw-loader',
      },
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ],
    
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "wr-mock.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      title: 'Development',
    }),
  ]
};
