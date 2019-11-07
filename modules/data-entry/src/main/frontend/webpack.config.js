const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');

module_name = require("./package.json").name + ".";

module.exports = {
  mode: 'development',
  entry: {
    [module_name + 'redirect']: './src/dataQuery/redirect.js',
    [module_name + 'showQuery']: './src/dataQuery/query.js',
    [module_name + 'LiveTable']: './src/dataHomepage/LiveTable.jsx',
    [module_name + 'Questionnaires']: './src/dataHomepage/Questionnaires.jsx',
    [module_name + 'Subjects']: './src/dataHomepage/Subjects.jsx',
    [module_name + 'Forms']: './src/dataHomepage/Forms.jsx',
    [module_name + 'multipleChoice']: './src/questionnaire/MultipleChoice.jsx',
    [module_name + 'textQuestion']: './src/questionnaire/TextQuestion.jsx',
    [module_name + 'question']: './src/questionnaire/Question.jsx',
    [module_name + 'answer']: './src/questionnaire/Answer.jsx',
    [module_name + 'booleanQuestion']: './src/questionnaire/BooleanQuestion.jsx',
    [module_name + 'numberQuestion']: './src/questionnaire/NumberQuestion.jsx',
    [module_name + 'subjectsIcon']: '@material-ui/icons/AssignmentInd.js',
    [module_name + 'questionnairesIcon']: '@material-ui/icons/Assignment.js',
    [module_name + 'formsIcon']: '@material-ui/icons/Description.js',
    [module_name + 'dateQuestion']: './src/questionnaire/DateQuestion.jsx',
    [module_name + 'vocabularyQuestion']: './src/questionnaire/VocabularyQuestion.jsx'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackAssetsManifest({
      output: "assets.json"
    })
  ],
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
    filename: '[name].[contenthash].js'
  },
  externals: [
    {
      "moment": "moment",
      "react": "React",
      "react-dom": "ReactDOM",
      "react-router-dom": "ReactRouterDOM",
      "lodash": "lodash",
      "prop-types": "PropTypes",
      "@material-ui/core": "window['MaterialUI']"
    }
  ]
};
