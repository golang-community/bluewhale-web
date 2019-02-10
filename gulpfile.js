const gulp = require('gulp');
const del = require('del');
const gutil = require('gulp-util');
const webpack = require('webpack');
const server = require('gulp-develop-server');
const notifier = require('node-notifier');
const lightReload = require('light-reload');
const useref = require('gulp-useref');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');

gulp.task('clean', () => {
  return del(['dist/*', '!dist/dbFiles', '!dist/wwwroot', '!dist/node_modules'], { force: true });
});

gulp.task('server:clean', done => {
  del(['dist/**/*', '!dist/wwwroot'], { force: true });
  done();
});

gulp.task('server:copy', () => {
  return gulp.src(['src/**', '!src/web-front/**', '!src/web-front/**']).pipe(gulp.dest('dist/'));
});

gulp.task('server:start', callback => {
  lightReload.init();
  server.listen({ path: 'dist/index.js' }, err => {
    if (err) console.log('listen', err);
  });
  callback();
});

gulp.task('server:restart', callback => {
  server.restart(err => {
    if (err) console.log('restart', err);
    notifier.notify({
      title: 'Humpback-Server',
      message: 'Server restarted.'
    });
  });
  callback();
});

gulp.task('server:watch', done => {
  gulp.watch(['src/**/*.js', '!src/web-front/**'], gulp.series('server:reload'));
  done();
});

gulp.task('release:html', () => {
  return gulp
    .src('dist/web-front/index.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest('dist/wwwroot'));
});

gulp.task('release:clean-unused-file', () => {
  let rootPath = 'dist/wwwroot/static';
  return del(
    [
      `${rootPath}/**/*.css`,
      `${rootPath}/**/*.js`,
      `!${rootPath}/vendor/css/vendor.min.css`,
      `!${rootPath}/vendor/js/vendor.min.js`,
      `!${rootPath}/css/site.min.css`,
      `!${rootPath}/js/site.min.js`
    ],
    { force: true }
  );
});

gulp.task('server:reload', gulp.series('server:copy', 'server:restart'));

gulp.task('dev', gulp.series('clean', 'server:copy', 'server:start', 'server:watch' /*, 'client:dev-build'*/));

gulp.task('release', gulp.series('clean', 'server:copy', 'release:html', 'release:clean-unused-file'));
