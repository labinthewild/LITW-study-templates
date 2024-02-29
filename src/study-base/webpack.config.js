var path = require("path");

var config = {
  entry: path.join(__dirname, "study-manager.js"),
  output: {
    path: path.join(__dirname, "js"),
    filename: "study-bundle.min.js"
  },
  module: {
    rules: [
        {
          test: require.resolve('jquery'),
            use: [{
              loader: 'expose-loader',
              options: {
                exposes: "jquery",
              },
            },
            {
              loader: 'expose-loader',
              options: {
                exposes: '$',
              },
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