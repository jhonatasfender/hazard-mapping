import HtmlWebpackPlugin from 'html-webpack-plugin'
import { resolve } from 'path'
import WebpackFavicons from 'webpack-favicons'

const __dirname = resolve()

const config = {
  entry: ['./app.js'],
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].bundle.js',
    path: resolve(__dirname, 'docs'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'body',
      template: 'public/index.html',
    }),
    new WebpackFavicons({
      src: 'public/img/hazard.png',
      path: 'img',
      background: '#000',
      theme_color: '#000',
      icons: {
        favicons: true,
      },
    }),
  ],
}

export default config
