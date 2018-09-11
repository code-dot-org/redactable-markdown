module.exports = {
  entry: './src/redactableMarkdownParser',
  output: {
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};
