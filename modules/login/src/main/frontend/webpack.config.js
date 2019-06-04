module.exports = {
    mode: 'development',
    entry: {
      login: './src/login/main.js',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    output: {
      path: __dirname + '/dist/SLING-INF/content/libs/lfs/resources/',
      publicPath: '/',
      filename: '[name].js'
    },
    devServer: {
      contentBase: './dist'
    }
  };
  