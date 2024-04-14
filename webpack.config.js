const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");

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
        new JsonMinimizerPlugin({
            test: /\.json$/i,
            include: /(json_source_v7|json_source_v8)\.json$/i,
            minimizerOptions: {
                replacer: null,
                space: 0
            }
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['**/*', '!*.html', '!*.min.js', '!*.json', '!*.min.json', '!*.ico']
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
