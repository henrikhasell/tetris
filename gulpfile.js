var gulp = require('gulp4');

let typescript = require("gulp-typescript");

gulp.task('copy', function() {
    return gulp.src([
        'node_modules/pixi.js/dist/pixi.min.js',
        'node_modules/pixi.js/dist/pixi.min.js.map'
    ]).pipe(gulp.dest('wwwroot'));
});

gulp.task('compile', function() {
    return gulp.src([
        'ts/tetris.ts'
    ])
    .pipe(typescript()).pipe(gulp.dest('wwwroot'));
});

gulp.task('watch', function() {
    return gulp.watch('ts/**/*.ts', gulp.series('compile'));
});

gulp.task('default', gulp.parallel(['copy', 'compile']));