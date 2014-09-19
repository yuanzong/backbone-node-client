var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

var paths = {
  test: './test/index.js',
  lib: './lib/**/*.js'
};

gulp.task('lint', function () {
  return gulp.src([paths.lib, paths.test])
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('test', function () {
  return gulp.src(paths.test)
    .pipe(mocha());
});
