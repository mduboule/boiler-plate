const { src, dest, watch, series, parallel } = require('gulp');

const sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    imagemin  = require('gulp-imagemin'),
    changed = require('gulp-changed'),
    replace = require('gulp-replace');

const imgSrc =  '../src/img/*',
    imgDest = '../dist/img/';

const files = {
  htmlPath: '../**/*.html',
  scssPath: '../src/**/*.scss',
  jsPath:   '../src/**/*.js',
  imgPath:  '../src/img/*'
}

const cssSrc =  [
  '../src/css/normalize.min.css',
  '../src/css/style.css',
];

function scssTask(){
  return src('../src/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('../src/css/')
  );
}

function concatCss() {
  return src(cssSrc)
  .pipe(sourcemaps.init({loadMaps: true, largeFile: true}))
  .pipe(concat('style.min.css'))
  .pipe(sourcemaps.write('./maps/'))
  .pipe(dest('../dist/'));
}

function jsTask(){
  return src([files.jsPath])
    .pipe(concat('all.js'))
    // .pipe(uglify())
    .pipe(dest('../dist/')
  );
}

function imgMin() {
  return src(imgSrc)
  .pipe(changed(imgDest))
    .pipe( imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5})
    ]))
  .pipe(dest(imgDest));
}

var cbString = new Date().getTime();
// Tricks the browser into reloading the js / css each time
function cacheBustTask(){
  return src(['../index.html'])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('../'));
}

function watchTask() {
  browserSync.init({
    server: {
      baseDir: "../"
    }
  });
  watch([files.htmlPath, files.scssPath, files.jsPath, files.imgPath],
    series(
      parallel(scssTask, jsTask, imgMin),
      concatCss
    )
  );
  watch([files.scssPath,
       files.htmlPath,
       files.jsPath,
       files.imgPath])
       .on('change', browserSync.reload);
}

exports.cacheBustTask = cacheBustTask;
exports.watchTask = watchTask;
exports.scssTask = scssTask;
exports.concatCss = concatCss;
exports.jsTask = jsTask;
exports.imgMin = imgMin;

exports.default = series(
  parallel(scssTask, jsTask, imgMin),
  cacheBustTask,
  concatCss,
  cacheBustTask,
  watchTask
);
