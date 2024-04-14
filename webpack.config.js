const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        javascript: './dist/sfiapdgen_func.js'
    },
    output: {
        filename: 'sfiapdgen_func.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.json$/i,
                type: "asset/resource",
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './dist/sfiapdgen.html',
            filename: 'sfiapdgen.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            }
        }),
        // Rename .json files to .min.json
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './dist/*.json',
                    to: './[name].min.json'
                },
                // Rename .css files to .min.css
                {
                    from: './dist/*.css',
                    to: './[name].min.css'
                }
            ]
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['**/*', '!*.html', '!*.min.js', '!*.min.json', '!*.ico', '!*.min.css']
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                    mangle: true,
                },
            }),
        ],
    },
};
