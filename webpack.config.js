// Modern Webpack config for ES6 .mjs SFIA app - Hybrid approach
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const outDir = isProd ? 'package/prd' : 'package/dev';

  return {
    entry: {
      // ES6 modules entry point
      es6_modules: {
        import: [
          path.resolve(__dirname, 'src/modules/urlHandling.mjs'),
          path.resolve(__dirname, 'src/modules/utilityFunctions.mjs')
        ],
        filename: 'es6_modules.js'
      }
    },
    output: {
      path: path.resolve(__dirname, outDir),
      clean: false, // Don't clean, we want to preserve Grunt-built files
      library: {
        name: 'ES6Modules',
        type: 'var'
      }
    },
    devtool: isProd ? false : 'source-map',
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    plugins: [
      // Only copy assets if they don't exist (Grunt already handles them)
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/*.css', to: '[name][ext]', noErrorOnMissing: true },
          { from: 'src/*.json', to: '[name][ext]', noErrorOnMissing: true },
          { from: 'src/favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
          { from: 'src/sfia-skills-table.html', to: 'sfia-skills-table.html', noErrorOnMissing: true },
          { from: 'src/vendor', to: 'vendor', noErrorOnMissing: true },
        ]
      })
    ],
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: isProd },
            mangle: true,
          },
        })
      ],
    },
    performance: {
      hints: false
    },
    resolve: {
      extensions: ['.mjs', '.js', '.json']
    }
  };
};
