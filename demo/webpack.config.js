const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./demo/demo.jsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: "babel-loader",
    }, {
      test: /\.md$/,
      loader: 'raw-loader',
    }]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  stats: {
    colors: true
  },
  devtool: 'source-map',
  devServer: { inline: true }
};
