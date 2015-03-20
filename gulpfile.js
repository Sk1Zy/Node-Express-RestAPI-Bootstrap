'use strict';

var gulp = require('gulp');
var minimist = require('minimist');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var colors = require('colors');
var moment = require('moment');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.paths = {
    src: 'src',
    tests: 'tests'
};

gulp.task('tests', function(done) { UnitTests(done) });

gulp.task('lint', function() {
  return gulp.src([gulp.paths.src + '/**.js', gulp.paths.tests + '/**.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

function UnitTests(done) {
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

function runTests(argv) {

    var coverage = argv.coverage ? argv.coverage : false;
    var reporters;

    if(typeof(coverage) === 'boolean') {
        reporters = ['html'];
    } else {
        reporters = coverage.split(',');
    }

    console.log('Running Mocha Unit Tests'.bold, '-' ,moment(Date.now()).format('MM/DD HH:mm:ss'));
    gulp.src([gulp.paths.src + '/**.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src([gulp.paths.tests + '/**.spec.js'])
            .pipe(mocha())
            .pipe(istanbul.writeReports({ reporters: reporters , reportOpts: { dir: 'reports/coverage/'}}));
        });
}