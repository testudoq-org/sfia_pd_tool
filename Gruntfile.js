module.exports = function (grunt) {
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
                debounceDelay: 1000
            },
            files: ['src/**/*'],
            tasks: ['delayedBuild']
        },
        exec: {
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
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('build', ['clean', 'copy', 'string-replace']);

    grunt.registerTask('testLocal', ['exec:codeceptjsLocal', 'copy']); // Added 'copy' task as dependency

    grunt.registerTask('testDist', ['exec:codeceptjsDist']); // TODO 'ftp-copy' task as dependency
    grunt.registerTask('testProduction', ['exec:codeceptjsProduction']); // removed  'copy' task as dependency

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
