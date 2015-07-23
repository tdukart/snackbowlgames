module.exports = function(grunt) {

  grunt.initConfig({
    bowerRequirejs: {
      target: {
        rjsConfig: 'src/ts/config.js',
        options: {
          transitive: true
        }
      }
    },
    clean: {
      dist: [
        'dist'
      ],
      generated: [
        'src/ts/generated'
      ]
    },
    copy: {
      dev: {
        files: [
          {
            dest: 'dist/js',
            src: ['**/*.js', '**/*.js.map'],
            cwd: 'src/js',
            expand: true,
            filter: 'isFile'
          }
        ]
      },
      rawJs: {
        files: [
          {
            dest: 'src/js',
            src: ['**/*.js', '**/*.js.map'],
            cwd: 'src/ts',
            expand: true,
            filter: 'isFile'
          }
        ]
      },
      html: {
        files: [
          {
            dest: 'dist',
            src: ['*.html'],
            cwd: 'src',
            expand: true,
            filter: 'isFile'
          }
        ]
      },
      prod: {
        files: [
          {
            dest: 'dist/js/lib',
            src: ['**/*.js'],
            cwd: 'src/ts/lib',
            expand: true,
            filter: 'isFile'
          }
        ]
      }
    },
    dust: {
      main: {
        files: [
          {
            dest: 'src/ts/generated/templates',
            src: ['**/*.dust'],
            cwd: 'src/templates',
            expand: true,
            filter: 'isFile',
            ext: '.js'
          }
        ],
        options: {
          wrapper: "amd",
          wrapperOptions: {
            deps: {
              dust: 'dustjs-linkedin'
            }
          },
          runtime: false,
          basePath: 'src'
        }
      }
    },
    less: {
      main: {
        options: {
          sourceMap: true,
          banner: '/* Automatically generated. DO NOT EDIT. */'
        },
        files: {
          'src/styles/main.css': ['src/styles/main.less']
        }
      }
    },
    ts: {
      options: {
        module: 'amd'
      },
      default: {
        src: ['src/ts/**/*.ts', '!src/ts/lib/**/*.ts'],
        dest: 'src/js'
      }
    },
    uglify: {
      dist: {
        files: [
          {
            dest: 'dist/js',
            src: ['**/*.js', '**/*.json', '!lib/**/*'],
            cwd: 'src/js',
            expand: true,
            filter: 'isFile'
          }
        ]
      }
    },
    watch: {
      files: ['src/**/*'],
      tasks: ['dev']
    }
  });

  grunt.loadNpmTasks('grunt-bower-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  //grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-dust');
  grunt.loadNpmTasks('grunt-ts');

  grunt.registerTask('generate', ['dust', 'less']);
  grunt.registerTask('install', ['generate']);
  grunt.registerTask('prep', ['generate', 'ts', 'copy:html', 'copy:rawJs']);
  grunt.registerTask('dev', ['prep', 'copy:dev']);
  grunt.registerTask('prod', ['clean', 'prep', 'uglify', 'copy:prod']);
  grunt.registerTask('default', 'dev');

};