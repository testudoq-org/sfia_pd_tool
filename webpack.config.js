const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        javascript: './src/sfiapdgen_func.js',
        html: './src/sfiapdgen.html'
    },
    output: {
        filename: 'sfiapdgen_func.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    // Additional options here
                    compress: {
                        drop_console: true, // Drop console statements
                    },
                    mangle: true, // Mangle variable names
                },
            }),
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/sfiapdgen.html', // HTML template file
            filename: 'sfiapdgen.html', // Output HTML file
            minify: {
                // Options to minify HTML
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            }
        })
    ]
};
