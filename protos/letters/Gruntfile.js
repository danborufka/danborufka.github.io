module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    sass: {
        editor: {
            src: 'css/source/Danimator.editor.scss',
            dest: 'css/source/Danimator.editor.css'
        }
    },
    concat: {
        main: {
            options: { separator: ';' },
            src: 'js/source/*.js',
            dest: 'js/Danimator.js'
        },
        // editor: {
        //     options: { separator: ';' },
        //     src: 'js/source/editor/*.js',
        //     dest: 'js/Danimator.editor.js'
        // },
        // styles: {
        //     src: 'css/source/*.css',
        //     dest: 'css/Danimator.editor.css'
        // }
    },
    // cssmin: {
    //     editor: {
    //         src: 'css/Danimator.editor.css',
    //         dest:'css/Danimator.editor.min.css'
    //     }
    // },
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            compress: {},
            mangle: true,
            sourceMap: true
        },
        target: {
            files: {
                'js/Danimator.min.js': ['js/Danimator.js']//,
                //'js/Danimator.editor.min.js': ['js/Danimator.editor.js']
            }
        }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['sass', 'concat', /*'cssmin',*/ 'uglify']);

};