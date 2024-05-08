module.exports = function (grunt) {
    // Load the package.json file and assign it to the pkg variable
    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        clean: {
            minFiles: ['dist/**/*.*min.*']
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'src', src: ['**/*.html', '**/*.css', '**/*.json', '**/*.ico'], dest: 'dist/', filter: 'isFile' },
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
                        {
                            pattern: 'sfiapdgen_func.js',
                            replacement: 'sfiapdgen_func.js'
                        },
                        // ... (other replacements)
                    ]
                }
            }
        },
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['src/browserUpdate.js', 'src/dataFetching.js', 'src/constants.js', 'src/exportFunctions.js', 'src/checkboxHandling.js', 'src/initializeContent.js', 'src/tableRendering.js', 'src/dataHandling.js', 'src/utilityFunctions.js', 'src/jsonHandling.js', 'src/urlHandling.js', 'src/eventListeners.js', 'src/windowEvents.js'],
                dest: 'src/sfiapdgen_func.js',
            },
        },
        watch: {
            options: {
                debounceDelay: 3000
            },
            files: ['src/**/*', 'src/sfiapdgen_func.js'],
            tasks: ['delayedBuild']
        },
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
                cmd: 'npx codeceptjs run --config=codecept.production.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('build', ['clean', 'copy', 'string-replace', 'concat']);

    grunt.registerTask('testSpecificFile', ['exec:codeceptjsLocalSpecific']);

    grunt.registerTask('testLocal', ['exec:codeceptjsLocal', 'copy']); // Added 'copy' task as dependency

    grunt.registerTask('testDist', ['exec:codeceptjsDist']); // TODO 'ftp-copy' task as dependency
    grunt.registerTask('testProduction', ['exec:codeceptjsProduction']); // removed 'copy' task as dependency

    grunt.registerTask('delayedBuild', function () {
        var done = this.async();
        setTimeout(function () {
            grunt.task.run('build');
            done();
        }, 1000);
    });

    grunt.registerTask('default', ['testLocal']);

    grunt.registerTask('debug', 'Debug task', function () {
        grunt.log.writeln('Replacements have been made successfully.');
    });
};
