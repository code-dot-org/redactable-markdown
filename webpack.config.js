module.exports = {
  entry: './src/redactableMarkdownProcessor',
  output: {
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
};
