'use strict';

/****** DEPENDENCIES ********/

import * as del from 'del';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import colors from 'colors';
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import jsHint from 'gulp-jshint';
import jsHintStylish from 'jshint-stylish';
import postCss from 'gulp-postcss';
import yargs from 'yargs';
import sassGlob from 'gulp-sass-glob';
import sassLint from 'gulp-sass-lint';
import sourceMaps from 'gulp-sourcemaps';
import * as sassPkg from 'sass';
import gulpSass from 'gulp-sass';


/********** VARIABLES *************/

// Hosts - change localhost for see it in browsersync
let path = 'localhost';

const sass = gulpSass(sassPkg);

// Paths
const srcAssets = {
  images: 'assets/images/',
  styles: 'assets/sass/'
};

const distAssets = {
  images: 'images/',
  js: 'js/',
  styles: 'css/'
};

const process = yargs.argv;

/********** TASKS ***************/

gulp.task('default', function () {
  console.log('');
  console.log('Cleaning tasks'.yellow);
  console.log('gulp ' + 'clean:styles'.cyan + '                        ' + '# Clean css files from css directory'.grey);
  console.log('gulp ' + 'clean:images'.cyan + '                        ' + '# Clean image files from images directory'.grey);
  console.log('');
  console.log('Compiling tasks'.yellow);
  console.log('gulp ' + 'imagemin'.cyan + '                            ' + '# Minify your images in ./assets/images into ./images'.grey);
  console.log('gulp ' + 'mainStyles:dev'.cyan + '                      ' + '# Compile expanded css except "pages" directory and create a maps file.'.grey);
  console.log('gulp ' + 'pagesStyles:dev'.cyan + '                      ' + '# Compile expanded css from "pages" directory exclusively and create a maps file.'.grey);
  console.log('gulp ' + 'mainStyles:pro'.cyan + '                      ' + '# Compile compressed css except "pages" directory, apply autoprefixer to result.'.grey);
  console.log('gulp ' + 'pagesStyles:pro'.cyan + '                      ' + '# Compile compressed css from "pages" directory exclusively, apply autoprefixer to result.'.grey);
  console.log('');
  console.log('Debugging tasks'.yellow);
  console.log('gulp ' + 'sasslint'.cyan + '                            ' + '# Check sass files looking for bad coding practices.'.grey);
  console.log('gulp ' + 'jshint'.cyan + '                              ' + '# Check js files looking for syntax errors.'.grey);
  console.log('');
  console.log('Watching tasks'.yellow);
  console.log('gulp ' + 'watch'.cyan + '                              ' + '# Run defined tasks if any specified files are changed.'.grey);
  console.log('gulp ' + 'watch -h'.cyan + ' yourhost'.green + '       ' + '# Modify your host to use BrowserSync.'.grey);
  console.log('gulp ' + 'browsersync'.cyan + '                        ' + '# Synchronize browser and device in real-time and reload browser on file changes.'.grey);
  console.log('');
  console.log('Developing task'.yellow);
  console.log('gulp ' + 'dev:watch'.cyan + '                          ' + '# Run development tasks: imagemin, mainStyles:dev, pagesStyles:dev, and watch.'.grey);
  console.log('gulp ' + 'dev:browser'.cyan + '                        ' + '# Run development tasks: imagemin, mainStyles:dev, pagesStyles:dev, and browserSync.'.grey);
  console.log('gulp ' + 'pro'.cyan + '                                ' + '# Run production tasks: imagemin, mainStyles:pro, pagesStyles:pro.'.grey);
  console.log('');
});

/************* CLEANING *****************/

// Clean css
gulp.task('clean:styles', function () {
  return del([
    distAssets.styles + '*.css',
    distAssets.styles + 'maps/'
  ]).then(paths => {
    console.log('Deleting css from:', distAssets.styles.magenta, '\n', paths.join('\n').magenta);
  });
});

// Clean images
gulp.task('clean:images', function () {
  return del([
    distAssets.images + '*',
    '!' + distAssets.images + '*.txt',
    '!' + distAssets.images + '*.md'
  ]).then(paths => {
    console.log('Deleting images from:', distAssets.images.magenta, '\n', paths.join('\n').magenta);
  });
});

/************* COMPILING *****************/

// Minify images
gulp.task('imagemin', gulp.series('clean:images', () =>
  gulp.src(srcAssets.images + '*')
    .pipe(imagemin([
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ], { verbose: true }))
    .pipe(gulp.dest(distAssets.images))
));

// Main styles to development
gulp.task('mainStyles:dev', function () {
  return gulp.src([
      '!' + srcAssets.styles + 'pages/**/*.s+(a|c)ss',
      srcAssets.styles + '**/*.s+(a|c)ss'
    ])
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(sourceMaps.write('maps'))
    .pipe(gulp.dest(distAssets.styles))
    .pipe(browserSync.stream());
});

// Pages styles to development
gulp.task('pagesStyles:dev', function () {
  return gulp.src(srcAssets.styles + 'pages/**/*.s+(a|c)ss')
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(sourceMaps.write('maps'))
    .pipe(gulp.dest(distAssets.styles))
    .pipe(browserSync.stream());
});

// Main styles to production
gulp.task('mainStyles:pro', function () {
  return gulp.src([
      '!' + srcAssets.styles + 'pages/**/*.s+(a|c)ss',
      srcAssets.styles + '**/*.s+(a|c)ss'
    ])
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postCss([ autoprefixer() ]))
    .pipe(gulp.dest(distAssets.styles));
});

// Pages styles to production
gulp.task('pagesStyles:pro', function () {
  return gulp.src(srcAssets.styles + 'pages/**/*.s+(a|c)ss')
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postCss([ autoprefixer() ]))
    .pipe(gulp.dest(distAssets.styles));
});

/************* DEBUGGING *****************/

// Sass lint
gulp.task('sasslint', function () {
  return gulp.src(srcAssets.styles + '**/*.s+(a|c)ss')
    .pipe(sassLint({ configFile: 'esm_theme.sass-lint.yml' }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

// jsHint
gulp.task('jshint', function () {
  return gulp.src([distAssets.js + '*.js'])
    .pipe(jsHint())
    .pipe(jsHint.reporter(jsHintStylish))
    .pipe(browserSync.stream());
});

/************** DEMONS **********************/

// WATCH
gulp.task('watch', function () {
  gulp.watch(srcAssets.styles + '**/*.s+(a|c)ss', gulp.series('mainStyles:dev', 'pagesStyles:dev'))
    .on('change', function (path) {
      console.log('');
      console.log('-> File ' + path.magenta.bold + ' was ' + 'changed'.green + ', running tasks css...');
    });

  gulp.watch(distAssets.js + '**/*.js', gulp.series('jshint'))
    .on('change', function (path) {
      console.log('');
      console.log('-> File ' + path + ' was ' + 'changed'.green + ', running tasks js...');
    });

  gulp.watch(srcAssets.images + '**/*', gulp.series('imagemin'))
    .on('change', function (path) {
      console.log('');
      console.log('-> File ' + path + ' was ' + 'changed'.green + ', running tasks images...');
    });
});

// Browser Sync
gulp.task('browsersync', function () {
  let openPath = 'local';
  if (process.h) {
    path = process.h;
    openPath = 'external';
    console.log(path.green + ' configured as new host.'.yellow);
  }
  browserSync.init({
    host: path,
    open: openPath,
    proxy: path
  });
  gulp.watch(srcAssets.styles + '**/*.s+(a|c)ss', gulp.series('mainStyles:dev', 'pagesStyles:dev'))
    .on('change', function (path) {
      console.log('');
      console.log('-> File ' + path.magenta.bold + ' was ' + 'changed'.green + ', running tasks...');
      browserSync.reload();
    });
});

/************** TIME TO WORK ***********************/

// Development environment
gulp.task('dev:watch', gulp.series('imagemin', 'mainStyles:dev', 'pagesStyles:dev', 'watch'));
gulp.task('dev:browsersync', gulp.series('imagemin', 'mainStyles:dev', 'pagesStyles:dev', 'browsersync'));

// Production environment
gulp.task('pro', gulp.series('imagemin', 'mainStyles:pro', 'pagesStyles:pro'));
