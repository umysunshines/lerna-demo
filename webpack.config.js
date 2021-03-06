const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = options => {
  return {
    mode: 'production',
    entry: path.resolve(options.path, './src/index'),
    output: {
      path: path.resolve(options.path, './dist'),
      filename: `index.min.js`,
      library: options.name,
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    externals: options.externals,
    plugins: [
      new CleanWebpackPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [path.resolve(options.path, './src')],
          options: {
            configFile: path.resolve(__dirname, 'babel.config.js')
          }
        }
      ]
    },
    optimization: {
      minimize: true
    }
  }
}
