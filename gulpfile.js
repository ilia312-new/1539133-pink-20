const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const csso = require("gulp-csso");
const rename = require("gulp-rename");

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream())
}

exports.styles = styles;

// Server // don't disturbed

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  styles, server, watcher
);

// minimization

gulp.task("csso", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream())
});

// imageoptimize

gulp.task("images", function () {
  return gulp.src("source/img/**/*{jpg,png}")
    .pipe(imagemin([
      imagemin.mozjpeg({quality: 50, progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
    ]))
    .pipe(gulp.dest("source/img/test"));
});

// copy

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/*.html",
    "source/css/*.css",
    "source/js/**"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
});

gulp.task("move", function () {
  return gulp.src([
      "source/img/*.svg",
      "source/img/test/*.{png,jpg}"
  ])
    .pipe(gulp.dest("build/img"))
});

gulp.task("webp", function () {
  return gulp.src("source/img/webp/*.webp")
    .pipe(gulp.dest("build/img/webp"))
});

gulp.task("sprite", function () {
  return gulp.src("source/img/symbols.svg")
    .pipe(gulp.dest("build/img"))
});

// building

gulp.task("build", gulp.series("csso", "copy", "move", "webp", "sprite"));

// clean

gulp.task("clean", function () {
  return del("build")
});

// server

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
})
