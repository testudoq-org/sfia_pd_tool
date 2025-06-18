// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser'; // Ensure this import is correct for the installed version

const isProduction = process.env.BUILD === 'production';

export default {
    input: 'src/modules/app.mjs', // Our new entry point
    output: {
        file: isProduction ? 'package/prd/js/sfiapdgen_func.js' : 'package/dev/js/sfiapdgen_func.js',
        format: 'iife', // Immediately Invoked Function Expression - good for browser scripts
        sourcemap: !isProduction ? 'inline' : false, // Inline sourcemap for dev, none for prod
        name: 'SFIAApplication' // A global variable name for the bundle (optional, but can be useful)
    },
    plugins: [
        resolve(), // so Rollup can find external modules in node_modules
        commonjs(), // so Rollup can convert CommonJS modules to ES modules (if any of your dependencies are CommonJS)
        isProduction && terser() // Minify the bundle only in production
    ]
};