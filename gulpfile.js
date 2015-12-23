/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */
var gulp = require('gulp'),
    concat = require('gulp-concat');
//notify = require('gulp-notify');

gulp.task('default', function() {
    return gulp.src('./js/*.js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('./js/dest/'))
    //.pipe(notify('Well done, you smart motherfucker'));
});

gulp.task('watch', function(){
    gulp.watch('./js/*.js', ['default']);
});