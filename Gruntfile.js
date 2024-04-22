module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            minFiles: ['dist/**/*.*min.*'] // Update to clean the 'dist' directory instead of 'src'
        },
        copy: {
            main: {
                files: [
                    // Copy HTML, CSS, JSON, and ICO files
                    { expand: true, cwd: 'src', src: ['**/*.html', '**/*.css', '**/*.json', '**/*.ico'], dest: 'dist/', filter: 'isFile' },
                    // Copy JS files excluding those with ".min." in their names
                    { expand: true, cwd: 'src', src: ['**/*.js', '!**/*.min.*'], dest: 'dist/', filter: 'isFile' }
                ]
            }
        },
        'string-replace': {
            dist: {
                files: {
                    'dist/sfiapdgen.html': 'dist/sfiapdgen.html',
                    'dist/sfiapdgen_func.js': 'dist/sfiapdgen_func.js',
                },
                options: {
                    replacements: [
                       //  {
                        // pattern: '/src/', // Replace '/src/' with '/sfia/'
                        //   replacement: '/sfia/' // Replace '/src/' with '/sfia/'
                        // },
                        // {
                        //     pattern: 'sfiapdgen_func.js', // Replace 'sfiapdgen_func.js' old src filename
                        //     replacement: 'sfiapdgen_func.min.js'  // Replace 'sfiapdgen_func.js' with the new dist filename
                        // },
                        // {
                        //     pattern: 'styles.css', // Replace 'styles.css' old filename
                        //     replacement: 'styles.min.css'  // Replace 'styles.css' with the new filename
                        // },
                        // {
                        //     pattern: 'let jsonUrl = currentHost + "/src/" + selectedVersion + ".json";', // Replace the old jsonUrl pattern
                        //    replacement: 'let jsonUrl = currentHost + "/sfia/" + selectedVersion + ".json";'  // Replace with the new jsonUrl pattern
                        //}

                    ]
                }
            }
        },
        watch: {
            options: {
                debounceDelay: 1000 // Add a delay of 1 second (1000 milliseconds)
            },
            files: ['src/**/*'],
            tasks: ['delayedBuild'] // Run the delayed build task
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Define a custom task to run clean before copy
    grunt.registerTask('build', ['clean', 'copy', 'string-replace']);

    // Define a custom task for delayed build
    grunt.registerTask('delayedBuild', function () {
        var done = this.async();
        setTimeout(function () {
            grunt.task.run('build');
            done();
        }, 1000); // Add a delay of 1 second (1000 milliseconds)
    });

    // Set the default task
    grunt.registerTask('default', ['build']);

    // Custom task for debugging
    grunt.registerTask('debug', 'Debug task', function () {
        grunt.log.writeln('Replacements have been made successfully.');
    });
};
