var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require("tsify");

gulp.task('default', (done) => {
    return browserify({
        basedir: './src',
        debug: true,
        entries: ['index.ts']
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest("../backend/dj_app/static/dist"));

})
