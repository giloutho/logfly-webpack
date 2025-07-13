const rules = require('./webpack.rules');
const CopyPlugin = require("copy-webpack-plugin");

rules.push(
  {
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
);

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/assets/images', to: 'main_window/static/images' },
      ],
    }),
  ]
};

/* Solution for static images path in renderer process:
 1. Use the CopyPlugin to copy images from src/assets/images to main_window/static/images.
 2. In HTML or JavaScript, reference the images using :
       iconType = '<img src="../main_window/static/images/windsock22.png" alt="atterrissage"></img>';

Coming from https://gist.github.com/bbudd/2a246a718b7757584950b4ed98109115?permalink_comment_id=4746857#gistcomment-4746857
*/
