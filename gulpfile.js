var gulp = require('gulp'),
    swig = require('gulp-swig'),
    swig_configs = require('./swig-configs'),
    del = require('del'),
    connect = require('gulp-connect'),
    substituter = require('gulp-substituter'),
    substituter_configs = require('./substituter-configs'),
    less = require('gulp-less');

var paths = {
    templates: 'src/views/**/*.html',
    scripts: 'src/assets/js/**/*.js',
    styles: 'src/assets/css/**/*.css',  
    images: 'src/assets/images/**/*',
    fonts: 'src/assets/fonts/**/*',
    less: 'src/assets/less/**/*.less',
    less1: 'src/assets/less/bootstrap-less/bootstrap.less',
    less2: 'src/assets/less/style/style.less',
};

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    port: 3000,
    livereload: false
  });
});

gulp.task('html', function () {
  gulp.src('build//**/*.html')
    .pipe(connect.reload());
});


gulp.task('templates', function() {
  return gulp.src(paths.templates)
    .pipe(swig(swig_configs))
    .pipe(substituter(substituter_configs))
    .pipe(gulp.dest('build/'))
});


gulp.task('styles', function() {
  return gulp.src(paths.styles)
    .pipe(gulp.dest('build/assets/css'));
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('build/assets/fonts'));
});

gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('build/assets/images'));
});

gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(gulp.dest('build/assets/js'));
});

gulp.task('less1', function() {
  return gulp.src(paths.less1)
    .pipe(less())
    .pipe(gulp.dest('src/assets/css'));
});
gulp.task('less2', function() {
  return gulp.src(paths.less2)
    .pipe(less())
    .pipe(gulp.dest('src/assets/css'));
});

gulp.task('watch', function() {  
    gulp.watch(['build/*.html'], ['html']);    
    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.fonts, ['fonts']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.less, ['less1', 'less2']);
});

gulp.task('default', ['connect', 'watch', 'scripts', 'less1', 'less2', 'styles', 'fonts', 'images', 'templates']);
