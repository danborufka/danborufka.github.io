module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    paths: {
            src: {
                main: 'js/source/*.js',
                editor: 'js/source/editor/*.js'
            },
            dest: {
                main: 'js/Danimator.js',
                mainMin: 'js/Danimator.min.js',
                editor: 'js/Danimator.editor.js',
                editorMin: 'js/Danimator.editor.min.js',
            }
        },
    concat: {
        main: {
            options: { separator: ';' },
            src: '<%= paths.src.main %>',
            dest: '<%= paths.dest.main %>'
        },
        editor: {
            options: { separator: ';' },
            src: '<%= paths.src.editor %>',
            dest: '<%= paths.dest.editor %>'
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
                '<%= paths.dest.mainMin %>': ['<%= paths.dest.main %>'],
                '<%= paths.dest.editorMin %>': ['<%= paths.dest.editor %>']
            }
        }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['concat','uglify']);

};