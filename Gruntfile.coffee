module.exports = (grunt) ->

  # Load Tasks
  # ----------------------------------------
  grunt.loadNpmTasks 'grunt-closurecompiler'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-sass'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-react'
  grunt.loadNpmTasks 'grunt-webpack'

  # Define Custom Tasks
  # ----------------------------------------
  grunt.registerTask 'build', ['copy', 'coffee', 'react', 'sass', 'webpack']
  grunt.registerTask 'default', ['server']
  grunt.registerTask 'minify', ['closurecompiler:minify']
  grunt.registerTask 'server', ['build', 'connect', 'watch']

  # Configure Tasks
  # ----------------------------------------
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    clean: ['./dist', './src/javascripts']

    closurecompiler:
      minify:
        files:
          'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
        options:
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          max_processes: 5
          banner: '/* Copyright (2013) John Lynch,  MIT License */'

    coffee:
      options:
        bare: true
      build:
        files: [
          expand: true
          cwd: './src/coffeescripts'
          src: ['**/*.coffee']
          dest: './src/javascripts'
          ext: '.jsx'
        ]

    copy:
      build:
        files: [
          {
            expand: true
            cwd: './src/images'
            src: ['*']
            dest: './dist/images'
          },
          {
            expand: true
            cwd: './src/fonts'
            src: ['*']
            dest: './dist/fonts'
          },
          {
            expand: true
            cwd: './examples'
            src: ['*']
            dest: './dist'
          },
          {
            './dist/es5-shim.js': './bower_components/es5-shim/es5-shim.js',
            './dist/es5-sham.js': './bower_components/es5-shim/es5-sham.js'
          }
        ]

    connect:
      server:
        options:
          hostname: '0.0.0.0'
          port: 9292
          base: './dist'

    react:
      build:
        expand: true
        cwd: './src/javascripts'
        src: ['**/*.jsx']
        dest: './src/javascripts'
        ext: '.js'

    sass:
      build:
        files:
          './dist/<%= pkg.name %>.css': './src/stylesheets/<%= pkg.name %>.scss'

    watch:
      coffee:
        files: './src/coffeescripts/**/*.coffee'
        tasks: ['coffee', 'react', 'webpack']
        options:
          livereload: true
      sass:
        files: './src/stylesheets/*.scss'
        tasks: ['sass']
        options:
          livereload: true
      images:
        files: './src/images/*.*'
        tasks: ['copy']
        options:
          livereload: true
      examples:
        files: './examples/*.*'
        tasks: ['copy']
        options:
          livereload: true

    webpack:
      build:
        entry: './src/javascripts/<%= pkg.name %>.js'
        output:
          path: 'dist/'
          filename: '<%= pkg.name %>.js'
        resolve:
          modulesDirectories: ['node_modules', 'bower_components', 'vendor']
        stats:
          colors: true
          modules: true
          reasons: true
