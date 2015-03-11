var gulp = require('gulp');
var apidoc = require('gulp-apidoc');
//var jsinspect = require('gulp-jsinspect');
var jscs = require('gulp-jscs');

gulp.task('apidoc', function() {
    apidoc.exec({
        src: "app/controllers",
        dest: "docs/api",
        debug: true
    });
});



gulp.task('jscs', function() {
	return gulp.src('app/**/*.js')
		.pipe(jscs());
});