module.exports = {
  entry: './src/redactableMarkdownProcessor',
  output: {
    libraryTarget: 'umd',
  },
  target: 'node',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ['@babel/preset-env'],
        },
      }
    ]
  }
};
