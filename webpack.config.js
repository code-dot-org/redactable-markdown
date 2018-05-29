const webpack = require('webpack');

module.exports = {
  entry: {
    "bin/redact": "./src/bin/redact.js",
    "bin/render": "./src/bin/render.js",
    "bin/restore": "./src/bin/restore.js"
  },
  target: 'node',
  module: {
    rules: [{
      test: /\.js$/,
      loader: "babel-loader",
    }]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true
    })
  ]
};

