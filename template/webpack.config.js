var path = require("path");
var webpack = require("webpack");

var config = {
  entry: path.join(__dirname, "src", "study.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.min.js"
  },
  module: {
    loaders: [
      // NOTE: make jquery available globally, so LITW modules
      // and jsPsych loaded externally can use it
      { test: require.resolve('jquery'), loader: 'expose-loader?jQuery!expose-loader?$' },
      { test: /.*\.html$/, loader: "handlebars-loader" }
    ]
  }
};

module.exports = config;