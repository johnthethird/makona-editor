module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    # Compile to JSX first, then we will compile the JSX in another task and move to /dist
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

    copy:
      build:
        files: [
          {
            expand: true
            cwd: './src/images'
            src: ["*"]
            dest: './dist/images'
          },
          {
            expand: true
            cwd: './src/fonts'
            src: ["*"]
            dest: './dist/fonts'
          },
          {
            expand: true
            cwd: './examples'
            src: ["*"]
            dest: './dist'
          },
          {
            './dist/es5-shim.js': './bower_components/es5-shim/es5-shim.js',
            './dist/es5-sham.js': './bower_components/es5-shim/es5-sham.js'
          }
        ]

    # concat:
    #   options:
    #     separator: ";"
    #   dist:
    #     src: ["src/**/*.js"]
    #     dest: "dist/<%= pkg.name %>.js"

    # uglify:
    #   options:
    #     banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"dd-mm-yyyy\") %> */\n"
    #   dist:
    #     files:
    #       "dist/<%= pkg.name %>.min.js": ["<%= concat.dist.dest %>"]

    closurecompiler:
      minify:
        files:
          "dist/<%= pkg.name %>.min.js": ["dist/<%= pkg.name %>.js"]
        options:
          compilation_level: "SIMPLE_OPTIMIZATIONS"
          #compilation_level: "ADVANCED_OPTIMIZATIONS"
          max_processes: 5
          banner: "/* Copyright (2013) John Lynch,  MIT License */"

    webpack:
      build:
        debug:true
        entry: "./src/javascripts/<%= pkg.name %>.js"
        output:
          path: "dist/"
          filename: "<%= pkg.name %>.js"
#        optimize:
#          minimize: true
#        provide:
#          $: "jquery"
#          jQuery: "jquery"
        stats:
          colors: true
          modules: true
          reasons: true


    # jshint:
    #   files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"]
    #   options:
    #     globals:
    #       jQuery: true
    #       console: true
    #       module: true
    #       document: true

    regarde:
      coffee:
        files: "./src/coffeescripts/**/*.coffee"
        tasks: ["coffee", "spawn_react", "webpack"]
      sass:
        files: "./src/stylesheets/*.scss"
        tasks: ["spawn_sass"]
      images:
        files: './src/images/*.*'
        tasks: ["copy"]
      examples:
        files: './examples/*.*'
        tasks: ["copy"]

    # Set up a static file server
    connect:
      server:
        options:
          hostname: "0.0.0.0"
          port: 9292
          base: "."
          keepalive: true

    # Clean up artifacts
    clean: ["./dist", "./src/javascripts"]

    # Execute server script
    exec:
      server:
        cmd: "./server.js"


  # Dependencies
  # ==========
  #for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
  #    grunt.loadNpmTasks name
  grunt.loadNpmTasks "grunt-contrib-uglify"
  #grunt.loadNpmTasks "grunt-contrib-jshint"
  #grunt.loadNpmTasks "grunt-contrib-watch"
  #grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-sass"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-regarde"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-closurecompiler"
  grunt.loadNpmTasks "grunt-webpack"
  grunt.loadNpmTasks "grunt-exec"
  grunt.loadNpmTasks 'grunt-react'

  # Make sure we get an error on compilation instead of a hang
  grunt.registerTask 'spawn_sass', 'Run Sass in a subprocess', () ->
    done = this.async()
    grunt.util.spawn grunt: true, args: ['sass'], opts: {stdio: 'inherit'}, (err) ->
      if err
        grunt.log.writeln(">> Error compiling SASS file!")
      done()

  # Make sure we get an error on compilation instead of a hang
  grunt.registerTask 'spawn_react', 'Run React in a subprocess', () ->
    done = this.async()
    grunt.util.spawn grunt: true, args: ['react'], opts: {stdio: 'inherit'}, (err) ->
      if err
        grunt.log.writeln(">> Error compiling React JSX file!")
      done()

  grunt.registerTask "server", ["exec:server"]
  grunt.registerTask "minify", ["closurecompiler:minify"]
  #grunt.registerTask "test", ["jshint"]
  #grunt.registerTask "build", ["copy", "coffee", "spawn_react", "spawn_sass", "concat", "uglify"]
  #grunt.registerTask "build", ["copy", "coffee", "spawn_react", "spawn_sass"]
  grunt.registerTask "build", ["copy", "coffee", "spawn_react", "spawn_sass", "webpack"]
 # grunt.registerTask "react", ["react"]
