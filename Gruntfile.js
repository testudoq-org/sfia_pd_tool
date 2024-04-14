module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            minFiles: ['src/**/*.*min.*']
        },
        copy: {
            main: {
                files: [
                    // Copy HTML files
                    { expand: true, cwd: 'src', src: ['**/*.html'], dest: 'dist/', filter: 'isFile' },
                    // Copy CSS files
                    { expand: true, cwd: 'src', src: ['**/*.css'], dest: 'dist/', filter: 'isFile' },
                    // Copy JSON files
                    { expand: true, cwd: 'src', src: ['**/*.json'], dest: 'dist/', filter: 'isFile' },
                    // Copy ICO files
                    { expand: true, cwd: 'src', src: ['**/*.ico'], dest: 'dist/', filter: 'isFile' },
                    // Copy JS files excluding those with ".min." in their names
                    { expand: true, cwd: 'src', src: ['**/*.js', '!**/*.min.*'], dest: 'dist/', filter: 'isFile' }
                ]
            }
        },
        'string-replace': {
            inline: {
                files: {
                    'dist/sfiapdgen.html': 'dist/sfiapdgen.html'
                },
                options: {
                    replacements: [
                        {
                            pattern: 'sfiapdgen_func.js', // Replace 'sfiapdgen_func.js' old src filename
                            replacement: 'sfiapdgen_func.min.js'  // Replace 'sfiapdgen_func.js' with the new dist filename
                        },
                        {
                            pattern: 'styles.css', // Replace 'styles.css' old filename
                            replacement: 'styles.min.css'  // Replace 'styles.css' with the new filename
                        }
                    ]
                }
            },
            src_to_sfia: {
                files: {
                    src: ['dist/*.js']
                },
                options: {
                    replacements: [
                        {
                            pattern: /\/src\//g, // Match '/src/' globally
                            replacement: '/sfia/' // Replace '/src/' with '/sfia/'
                        }
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');

    // Define a custom task to run clean before copy
    grunt.registerTask('build', ['clean', 'copy', 'string-replace']);

    // Set the default task
    grunt.registerTask('default', ['build']);
};
