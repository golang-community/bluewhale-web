const gulp = require('gulp');
const del = require('del');
const shelljs = require('shelljs');
const server = require('gulp-develop-server');
const notifier = require('node-notifier');
const lightReload = require('light-reload');

gulp.task('clean', () => {
  return del(['dist/*'], { force: true });
});

gulp.task('clean:api', () => {
  return del(['dist/*', '!dist/dbFiles', '!dist/wwwroot'], { force: true });
});

gulp.task('clean:web', () => {
  return del(['dist/wwwroot/**/*'], { force: true });
});

gulp.task('copy:api', () => {
  return gulp
    .src(['src/**', '!src/web-front/**', 'package.json', 'package-loc[k].json'], { allowEmpty: true })
    .pipe(gulp.dest('dist/'));
});

gulp.task('api:start', done => {
  lightReload.init();
  server.listen({ path: 'dist/index.js' }, err => {
    if (err) {
      console.error('listen', err);
    }
    done();
  });
});

gulp.task('api:restart', done => {
  server.restart(err => {
    if (err) {
      console.error('restart', err);
    }
    notifier.notify({
      title: 'Bluewhale-server',
      message: 'Server restarted.'
    });
    done();
  });
});

gulp.task('api:watch', done => {
  gulp.watch(['src/**/*.js', '!src/web-front/**'], gulp.series('copy:api', 'api:restart'));
  done();
});

gulp.task('dev', gulp.series('clean:api', 'copy:api', 'api:start', 'api:watch'));

gulp.task('build', gulp.series('copy:api'));
