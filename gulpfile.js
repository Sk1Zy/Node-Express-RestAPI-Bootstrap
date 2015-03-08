var gulp = require('gulp');
var apidoc = require('gulp-apidoc');

gulp.task('apidoc', function() {
    apidoc.exec({
        src: "app/controllers",
        dest: "docs/api",
        debug: true
    });
});