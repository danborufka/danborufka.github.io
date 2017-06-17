module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    sass: {
        editor: {
            src: 'css/source/game.scss',
            dest: 'css/game.css'
        }
    },
    cssmin: {
        editor: {
            src: 'css/game.css',
            dest:'css/game.min.css'
        }
    },
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            compress: {},
            mangle: true,
            sourceMap: true
        },
        target: {
            files: {
                'js/game.min.js': ['js/game.js']
            }
        }
    },
    watch: {
      game: {
        files: ['js/game.js'],
        tasks: ['uglify']
      },
      styles: {
        files: ['css/source/*.scss'],
        tasks: ['sass','cssmin']
      }
    }

  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['uglify', 'sass', 'cssmin', 'watch']);

};