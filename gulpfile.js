const { series, src, dest, parallel } = require("gulp");
const watch = require("gulp-watch");
const maps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const image = require("gulp-image");
const browserSync = require("browser-sync");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const webpack = require("webpack-stream");
sass.compiler = require("sass");
const postcss = require("gulp-postcss");
const server = browserSync.create();
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const paths = {
  scss: {
    src: ["src/assets/scss/*.scss"],
    watcher: ["src/assets/scss/**/*"],
    dest: "dist/assets/css/",
  },
  css: {
    src: ["dist/assets/css/style.css"],
    dest: "dist/assets/css/",
  },
  images: {
    src: "src/assets/images/**/*.{jpg, jpeg, svg, png, gif}",
    dest: "dist/assets/images/",
  },
  scripts: {
    src: ["src/assets/js/main.js"],
    watcher: ["src/assets/js/**/*"],
    dest: "dist/assets/js/",
  },
  other: {
    src: [
      "src/assets/**/*.*",
      "!src/assets/scss/**/**",
      "!src/assets/js/**/**",
      "!src/assets/images/**/**",
    ],
    watcher: ["**/*.php"],
    dest: "dist/assets/",
  },
};

// Gulp Pipe for compiling SASS main file
function styleScss() {
  const tailwindcss = require("tailwindcss");
  return (
    src("./src/assets/scss/style.scss")
      .pipe(maps.init())
      .pipe(sass().on("Ha habido un problema compilando", sass.logError))
      .pipe(
        postcss([tailwindcss("./tailwind.config.js"), require("autoprefixer")])
      )
      .pipe(maps.write())
      .pipe(dest(paths.scss.dest))
      .pipe(server.stream())
  );
}

// Gulp Pipe for minifying CSS main file
function styleCss() {
  return src(paths.css.src)
    .pipe(maps.init())
    .pipe(cleanCSS())
    .pipe(maps.write())
    .pipe(rename("style.min.css"))
    .pipe(dest(paths.css.dest));
}

//Gulp Pipe for minifying images and copying to dist folder
function images() {
  return src(paths.images.src)
    .pipe(
      image({
        pngquant: true,
        optipng: false,
        zopflipng: true,
        jpegRecompress: false,
        mozjpeg: true,
        gifsicle: true,
        svgo: true,
        concurrent: 10,
        quiet: true,
      })
    )
    .pipe(dest(paths.images.dest));
}

function bundle() {
  return src("./src/assets/js/main.js")
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(dest("./dist/assets/bundle"));
}

function watcher() {
  server.init({
    proxy: "http://gulp.localhost",
  });
  watch("src/assets/scss/**/*.scss").on(
    "change",
    series(styleScss, server.reload)
  );
  watch("src/assets/images/*.jpg").on("add", images);
  watch("src/assets/images/*.png").on("add", images);
  watch("src/assets/js/**/*.js").on("change", series(bundle, server.reload));
  watch("./**/*.php").on("change", server.reload);
  watch("tailwind.config.js", series(styleScss, styleCss, bundle)).on(
    "change",
    server.reload
  );
}

exports.styleScss = styleScss;
exports.styleCss = styleCss;
exports.images = images;
exports.bundle = bundle;
exports.compile = series(styleScss, styleCss, bundle);
exports.watcher = watcher;
