const path = require("path");
const glob = require('glob')
const PATHS = {
  src: path.join(__dirname, 'src')
}
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    libs: "./src/assets/js/libs.js", //specifying bundle with js libraries
    main: "./src/assets/js/main.js", //specifying bundle with custom js files
    "styles-libs": "./src/assets/js/styles-libs.js", //specifying bundle with css libraries
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  output: {
    filename: "[name].js",
  },
};
