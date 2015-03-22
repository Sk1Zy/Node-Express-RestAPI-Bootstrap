'use strict';

var gulp = require('gulp');
var minimist = require('minimist');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var colors = require('colors');
var moment = require('moment');
var nodemon = require('gulp-nodemon');
var apidoc = require('gulp-apidoc');
//var jsinspect = require('gulp-jsinspect');
var eslint = require('gulp-eslint');
var jscpd = require('gulp-jscpd');

// Folder path definitions
gulp.paths = {
    src: 'src',
    tests: 'tests'
};

/**
 * Gulp Tasks
 */
 gulp.task('tests', tests);
 gulp.task('server', server);
 gulp.task('apidoc', function() {
    apidoc.exec({
        src: "app/controllers",
        dest: "docs/api",
        debug: true
    });
 });

 gulp.task('lint', function () {
    // Note: To have the process exit with an error code (1) on
    //  lint error, return the stream and pipe to failOnError last.
    return gulp.src([gulp.paths.src + '/**/*.js', gulp.paths.test + '/**/*.js'])
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint.format());
});

 gulp.task('jscpd', function() {
  return gulp.src([gulp.paths.src + '/**/*.js', gulp.paths.test + '/**/*.js'])
    .pipe(jscpd({
      'min-lines': 13,
      verbose: true
    }));
});

/**
 * Run when the tests task is run.
 */
 function tests(done) {
    var argv = minimist(process.argv.slice(2));
    var auto = argv.auto ? argv.auto : false;

    if(auto === true) {
        console.log('Unit Tests will be run automatically on file change!'.bold.blue);
        gulp.watch([gulp.paths.tests + '/**', gulp.paths.src + '/**'], function() {
            runTests(argv);
        });
    }

    runTests(argv);
 }

/**
 * Runs all unit tests.
 */
 function runTests(argv) {

    var coverage = argv.coverage ? argv.coverage : false;
    var reporters;

    if(typeof(coverage) === 'boolean') {
        reporters = ['html'];
    } else {
        reporters = coverage.split(',');
    }

    console.log('Running Mocha Unit Tests'.bold, '-' ,moment(Date.now()).format('MM/DD HH:mm:ss'));

    gulp.src([gulp.paths.src + '/**'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
        gulp.src([gulp.paths.tests + '/**/*.spec.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports({ reporters: reporters , reportOpts: { dir: 'reports/coverage/'}}));
    });
 }

/**
 * Starts a nodemon server.
 */
 function server(done) {

    var argv = minimist(process.argv.slice(2));
    var env;

    if(argv.env) {
        if(typeof(argv.env) !== 'string') {
            throw new Error('Invalid env argument! Must specify which type of environment. Example: "staging" or "development"');
        } else {
            env = argv.env;
        }
    } else {
        if(argv.production || argv.prod) {
            env = 'production';
        } else if(argv.staging) {
            env = 'staging';
        } else if(argv.dev || argv.development) {
            env = 'development';
        } else {
            env = 'development';
        }
    }

    nodemon({
        script: 'app.js',
        ext: 'js',
        env: { 'NODE_ENV': env }
    });
 }

/**
 * Runs JSHint.
 */
 function hint() {
    return gulp.src([gulp.paths.src + '/**.js', gulp.paths.tests + '/**.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
 }