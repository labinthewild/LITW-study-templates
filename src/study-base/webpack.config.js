var path = require("path");

var config = {
  entry: path.join(__dirname, "study-model.js"),
  output: {
    path: path.join(__dirname, "..", "dist"),
    filename: "bundle-model.min.js"
  },
  module: {
    rules: [
        {
          test: require.resolve('jquery'),
            use: [{
              loader: 'expose-loader',
              options: 'jQuery'
            },
            {
              loader: 'expose-loader',
              options: '$'
            }
            ]
        },
        {
          test: /.*\.html$/, loader: "handlebars-loader"
        }
    ]
  },
  externals: [
    /^(jquery.i18n|\$)$/i,
    {
       d3: "d3"
    }
  ],
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "url": false
    },
  }
};

module.exports = config;