module.exports = function (grunt) {
    // Load the package.json file and assign it to the pkg variable
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        // Clean task configuration
        clean: {
            dev: ['package/dev/**/*'],
            prd: ['package/prd/**/*']
        },

        // Copy task configuration
        copy: {
            dev: {
                files: [
                    { expand: true, cwd: 'src', src: ['**/*.html', '**/*.css', '**/*.json', '**/*.ico'], dest: 'package/dev/', filter: 'isFile' },
                    { expand: true, cwd: 'src', src: ['**/sfiapdgen_func.js', '!**/*.min.*'], dest: 'package/dev/', filter: 'isFile' }
                ]
            },
            prd: {
                files: [
                    { expand: true, cwd: 'src', src: ['**/*.html', '**/*.css', '**/*.json', '**/*.ico'], dest: 'package/prd/', filter: 'isFile' },
                    { expand: true, cwd: 'src', src: ['**/sfiapdgen_func.js', '!**/*.min.*'], dest: 'package/prd/', filter: 'isFile' },
                    { expand: true, cwd: 'src/vendor', src: ['*.css', '*.js'], dest: 'package/prd/vendor/', filter: 'isFile' },
                    { expand: true, cwd: 'src/vendor/ace', src: ['*.js'], dest: 'package/prd/vendor/ace/', filter: 'isFile' }
                ]
            }
        },

        // Uglify task configuration
        uglify: {
            options: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    passes: 1,
                    unsafe: false
                },
                mangle: {
                    keep_fnames: true
                },
                output: {
                    comments: false,
                    max_line_len: 500
                },
                sourceMap: false
            },
            prd: {
                files: {
                    'package/prd/sfiapdgen_func.min.js': ['package/prd/sfiapdgen_func.js']
                }
            }
        },

        // String replace task configuration
        'string-replace': {
            dev: {
                files: {
                    'package/dev/sfiapdgen.html': 'package/dev/sfiapdgen.html'
                },
                options: {
                    replacements: [{
                        pattern: 'sfiapdgen_func.js',
                        replacement: 'sfiapdgen_func.js'
                    }]
                }
            },
            prd: {
                files: {
                    'package/prd/sfiapdgen.html': 'package/prd/sfiapdgen.html'
                },
                options: {
                    replacements: [
                        {
                            pattern: '<head>',
                            replacement: '<head>\n' +
                                '    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; style-src \'self\' \'unsafe-inline\'; script-src \'self\' \'unsafe-inline\'; img-src \'self\' data:">\n' +
                                '    <meta http-equiv="X-Content-Type-Options" content="nosniff">'
                        },
                        {
                            // Handle Bootstrap CSS
                            pattern: /<link[^>]*bootstrap[^>]*>/,
                            replacement: '<link href="vendor/bootstrap.min.css" rel="stylesheet">'
                        },
                        {
                            // Handle jQuery
                            pattern: '<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>',
                            replacement: '<script src="vendor/jquery.min.js"></script>'
                        },
                        {
                            // Handle Bootstrap JS bundle
                            pattern: /<script[^>]*bootstrap\.bundle\.min\.js[^>]*>[\s\S]*?<\/script>/,
                            replacement: '<script src="vendor/bootstrap.bundle.min.js"></script>'
                        },
                        {
                            // Handle main app JS
                            pattern: 'sfiapdgen_func.js',
                            replacement: 'sfiapdgen_func.min.js'
                        },
                        {
                            pattern: '<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>',
                            replacement: '<script src="vendor/crypto-js.min.js"></script>'
                        },
                        {
                            pattern: '<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.8/ace.js"></script>',
                            replacement: '<script src="vendor/ace/ace.js"></script>'
                        },
                        {
                            pattern: '<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.8/mode-markdown.js"></script>',
                            replacement: '<script src="vendor/ace/mode-markdown.js"></script>'
                        },
                        {
                            pattern: '<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.8/theme-monokai.js"></script>',
                            replacement: '<script src="vendor/ace/theme-monokai.js"></script>'
                        }
                    ]
                }
            }
        },

        // Concat task configuration
        concat: {
            options: {
                separator: ';',
                sourceMap: true
            },
            dev: {
                options: {
                    sourceMap: true,
                    sourceMapStyle: 'inline'
                },
                src: ['src/init.js',
                    'src/theme.js', 'src/constants.js', 'src/browserUpdate.js', 'src/dataFetching.js', 
                    'src/exportFunctions.js', 'src/checkboxHandling.js', 'src/initializeContent.js', 
                    'src/tableRendering.js', 'src/dataHandling.js', 'src/utilityFunctions.js', 
                    'src/jsonHandling.js', 'src/urlHandling.js', 'src/eventListeners.js', 'src/windowEvents.js'],
                dest: 'package/dev/sfiapdgen_func.js'
            },
            prd: {
                src: ['src/init.js',
                    'src/theme.js', 'src/constants.js', 'src/browserUpdate.js', 'src/dataFetching.js', 
                    'src/exportFunctions.js', 'src/checkboxHandling.js', 'src/initializeContent.js', 
                    'src/tableRendering.js', 'src/dataHandling.js', 'src/utilityFunctions.js', 
                    'src/jsonHandling.js', 'src/urlHandling.js', 'src/eventListeners.js', 'src/windowEvents.js'],
                dest: 'package/prd/sfiapdgen_func.js'
            }
        },

        // Watch task configuration
        watch: {
            options: {
                debounceDelay: 3000
            },
            dev: {
                files: ['src/**/*'],
                tasks: ['build:dev']
            }
        },

        // Test execution configuration
        exec: {
            codeceptjsLocalSpecific: {
                cmd: 'npx codeceptjs run --config=codecept.local.conf.js --grep="check_levels_of_responsibility.local.test.js"'
            },
            codeceptjsLocal: {
                cmd: 'npx codeceptjs run --config=codecept.local.conf.js'
            },
            codeceptjsDist: {
                cmd: 'npx codeceptjs run --config=codecept.dist.conf.js'
            },
            codeceptjsProduction: {
                cmd: 'npx codeceptjs run --config=codecept.prod.conf.js'
            }
        }
    });

    // Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');

    // Development build - concatenates files with sourcemaps
    grunt.registerTask('build:dev', [
        'clean:dev',
        'copy:dev',
        'concat:dev',
        'string-replace:dev'
    ]);

    // Production build - full process including minification
    grunt.registerTask('build:prd', [
        'clean:prd',
        'copy:prd',
        'concat:prd',
        'uglify:prd',
        'string-replace:prd'
    ]);

    // Legacy build task for compatibility
    grunt.registerTask('build', ['build:dev']);

    // Test tasks
    grunt.registerTask('testSpecificFile', ['exec:codeceptjsLocalSpecific']);
    grunt.registerTask('testLocal', ['exec:codeceptjsLocal', 'copy:dev']);
    grunt.registerTask('testDist', ['exec:codeceptjsDist']);
    grunt.registerTask('testProduction', ['exec:codeceptjsProduction']);

    // Delayed build task
    grunt.registerTask('delayedBuild', function () {
        var done = this.async();
        setTimeout(function () {
            grunt.task.run('build:dev');
            done();
        }, 1000);
    });

    // Default task
    grunt.registerTask('default', ['build:dev']);

    // Debug task with enhanced logging
    grunt.registerTask('debug', 'Debug task', function () {
        grunt.log.writeln('Build configuration:');
        grunt.log.writeln('- Source files concatenated');
        grunt.log.writeln('- Sourcemaps generated');
        grunt.log.writeln('- Output directory: package/dev/');
        grunt.log.writeln('Build completed successfully.');
    });
};
