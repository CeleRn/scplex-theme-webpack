'use strick';
const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

// Webpack plugins
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

// Настройка для SVGO-loader
let svgoConfig = JSON.stringify({
  plugins: [{
    removeTitle: true
  }, {
    removeUselessStrokeAndFill: true
  }, {
    removeAttrs: {
      attrs: '(stroke|fill)'
    },
  }, {
    convertColors: {
      shorthex: false
    }
  }, {
    convertPathData: true
  }]
});

module.exports = {
  
  context: path.join(__dirname, "src"),

  entry: {
      commons: './commons'
  },

  output: {
    path: path.join(__dirname, "source", "assets"),
    filename: 'js/[name].js'
  },

  module: {
    rules: [
      { // Javascript
        test: /\.js$/,
        include: [
          path.join(__dirname, "src"),
          path.join(__dirname, "node_modules", "svg-sprite-loader", "lib", "plugin.js")
        ],
        use: "babel-loader"
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              // modules: true
            }
          },
          { loader: 'sass-loader' }
        ]
      },
      { // Картинки 
        test: /\.(png|jpg|svg|gif)$/,
        exclude: [
          path.join(__dirname, "src", "icons"),
          path.join(__dirname, "src", "images", "favicons")
        ],
        use: [
          'file-loader?name=images/[name].[ext]',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          },
        ],
      },
      { // Копируем шрифты
        test: /\.(ttf|eot|woff|woff2)$/,
        use: 'file?name=assets/fonts/[path][name].[ext]'
      }, {
        test: /\.svg$/,
        include: path.join(__dirname, "src", "icons"),
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
              spriteFilename: 'icons/icons-sprite.svg'
            }

          }, {
            loader: 'svgo-loader?' + svgoConfig
          }
        ]
      },
      {
        test: /\.(png|xml|ico)$/,
        include: path.join(__dirname, "src", "images", "favicons"),
        loader: 'file-loader?name=images/favicons/[name].[ext]'
      },
      {
        test: /\.json$/,
        include: path.join(__dirname, "src", "images", "favicons"),
        loader: 'file-loader?name=images/favicons/[name].[ext]|raw-loader'
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } },
      })
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new SpriteLoaderPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "css/[name].css",
      chunkFilename: "[id].css"
    })
  ]
};