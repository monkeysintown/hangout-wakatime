/* global require */
'use strict';

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

var merge = require('merge-stream');
var pkg = require('./package.json');
var fs = require('fs');

gulp.task('merge', function () {
    //.pipe($.inject(gulp.src(['./gadget/**/*.js', './gadget/**/*.css'], {read: false})))

    return gulp.src('./gadget/wakatime.xml')
        .pipe($.replace(/<link href="(wakatime\.css)"[^>]*>/g, function(s, filename) {
            var style = fs.readFileSync('./gadget/styles/' + filename, 'utf8');
            return '<style>\n' + style + '\n</style>';
        }))
        .pipe($.replace(/<script src="(wakatime\.js)"[^>]*>/g, function(s, filename) {
            var script = fs.readFileSync('./gadget/scripts/' + filename, 'utf8');
            return '<script>\n' + script + '\n</script>';
        }))
        .pipe($.replace(/<include src="(.*\.html)"[^>]*>/g, function(s, filename) {
            var html = fs.readFileSync('./gadget/' + filename, 'utf8');
            return '\n' + html + '\n';
        }))
        .pipe(gulp.dest('public/')); // this should be a temp directory; just adding this to Github to be able to publish directly from the repository
});

gulp.task('clean', function () {
    var del = require('del');
    var vinylPaths = require('vinyl-paths');

    return gulp.src(['.tmp', 'dist'], { read: false })
        .pipe(vinylPaths(del));
});

gulp.task('build', ['clean', 'merge'], function () {
    return gulp.src('.tmp/**/*')
        .pipe($.zip(pkg.name + '.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['package']);
