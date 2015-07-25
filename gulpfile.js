var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');

var paths = {
    'app': "src/jsx/app.jsx",
    'html': "src/index.html"
};

var dest = {
    'build': 'dist/build',
    'bin': 'dist/bin'
};

var vendors = {
    js: [
        'vendor/react/react-with-addons.js'
    ]
};

gulp.task('copy', function () {
    gulp.src(vendors.js, {base: './'})
        .pipe(gulp.dest(dest.build));
});

gulp.task('watch', ['build'], function () {
    gulp.watch(paths.html, ['copy']);

    var watcher  = watchify(browserify({
        entries: [paths.app],
        transform: [reactify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    }));

    return watcher.on('update', function () {
        watcher.bundle()
            .pipe(source('build.js'))
            .pipe(gulp.dest(dest.build));
        })
        .bundle()
        .pipe(source('build.js'))
        .pipe(gulp.dest(dest.build));
});

gulp.task('replaceHTML', function () {
    gulp.src(paths.html)
        .pipe(htmlreplace({
            'js': 'build.js',
            'vendorjs': vendors.js
        }))
        .pipe(gulp.dest(dest.build));
});

gulp.task('compile', function () {
    browserify({
        entries: [paths.app],
        transform: [reactify]
    })
        .bundle()
        .pipe(source('build.min.js'))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(dest.bin));
});

gulp.task('build', ['replaceHTML', 'copy'], function () {
    browserify({
        entries: [paths.app],
        transform: [reactify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    })
    .bundle()
    .pipe(source('build.js'))
    .pipe(gulp.dest(dest.build));
});