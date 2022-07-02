// COMMON
const { src, dest, watch, parallel, series } = require("gulp");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const del = require("del");
const sourcemaps = require("gulp-sourcemaps");
//SERVER
const browserSync = require("browser-sync").create();
// HTML
const fileinclude = require("gulp-file-include");
// CSS
const scss = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const postcss = require("gulp-postcss");
const mqpacker = require("css-mqpacker");
const csso = require("gulp-csso");
// JS
const uglify = require("gulp-uglify-es").default;
const babel = require("gulp-babel");
// IMAGE
const imagemin = require("gulp-imagemin");
// FONTS
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

//! MODE PRODUCTION START
function html() {
  return src("dev/*.html").pipe(dest("dist"));
}

function style() {
  return src("dev/css/style.css").pipe(dest("dist/css"));
}

function styleMin() {
  return src("dev/css/style.css")
    .pipe(sourcemaps.init())
    .pipe(postcss([mqpacker()]))
    .pipe(csso())
    .pipe(
      rename(function (path) {
        path.basename += ".min";
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest("dist/css"));
}

function styleVendors() {
  return src(["dev/css/vendors/**/*.css"]).pipe(dest("dist/css/vendors/"));
}

function js() {
  return src([
    "#src/js/**/*.js",
    "!#src/js/vendors/**/*.js",
    "!#src/js/three/**/*.js",
  ]).pipe(dest("dist/js"));
}

function jsMin() {
  return src([
    "dev/js/**/*.js",
    "!dev/js/vendors/**/*.js",
    "!dev/js/three/**/*.js",
  ])
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(
      rename(function (path) {
        path.basename += ".min";
      })
    )
    .pipe(uglify())
    .pipe(dest("dist/js"));
}

function jsVendors() {
  return src(["dev/js/vendors/**/*.js"]).pipe(dest("dist/js/vendors/"));
}

function jsThree() {
  return src(["dev/js/three/**/*.js"]).pipe(dest("dist/js/three/"));
}

function images() {
  return src("dev/img/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/img"));
}

function fonts() {
  return src("dev/fonts/**/*").pipe(dest("dist/fonts"));
}

function modal() {
  return src("dev/modal/**/*").pipe(dest("dist/modal"));
}

function cleanDist() {
  return del("dist/**/*");
}

exports.html = html;
exports.style = style;
exports.styleMin = styleMin;
exports.styleVendors = styleVendors;
exports.js = js;
exports.jsMin = jsMin;
exports.jsThree = jsThree;
exports.jsVendors = jsVendors;
exports.images = images;
exports.fonts = fonts;
exports.modal = modal;
exports.cleanDist = cleanDist;
exports.build = series(
  cleanDist,
  html,
  style,
  styleMin,
  styleVendors,
  js,
  jsMin,
  jsVendors,
  images,
  fonts,
  modal
);

//! MODE DEVELOP STAR
function browsersyncDev() {
  browserSync.init({
    server: {
      baseDir: "dev/",
    },
  });
}

function htmlDev() {
  return src("#src/views/*.html")
    .pipe(
      fileinclude({
        prefix: "@@",
      })
    )
    .pipe(dest("dev"));
}

function styleDev() {
  return src(["#src/scss/style.scss", "#src/components/**/*.scss"])
    .pipe(scss({ outputStyle: "expanded" }))
    .pipe(autoprefixer())
    .pipe(dest("dev/css"))
    .pipe(browserSync.stream());
}
/** ****************
 * TODO: scss({outputStyle: 'compressed'}) - for minification
 * TODO: scss({outputStyle: 'expanded'}) - for beatify
 ******************
 */

function styleVendorsDev() {
  return src(["node_modules/bootstrap/dist/css/bootstrap.min.css"]).pipe(
    dest("dev/css/vendors/")
  );
}

function jsDev() {
  return src(["#src/js/**/*.js", "!#src/js/vendors/**/*.js"])
    .pipe(concat("main.js"))
    .pipe(dest("dev/js"))
    .pipe(browserSync.stream());
}

// TODO: ADD HERE PLUGINS OF JS FROM NODE MODULES
function jsVendorsDev() {
  return src([
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
    "./node_modules/@popperjs/core/dist/umd/popper.min.js",
    "./node_modules/jquery/dist/jquery.slim.min.js",
  ]).pipe(dest("dev/js/vendors/"));
}

function imagesDev() {
  return src("#src/img/**/*").pipe(dest("dev/img"));
}

function otf2ttfDev() {
  return src(["#src/fonts/**/*.otf"])
    .pipe(
      fonter({
        formats: ["ttf"],
      })
    )
    .pipe(dest("#src/fonts"));
}

function ttf2woff2Dev() {
  return src(["#src/fonts/**/*", "!#src/fonts/**/*.otf"])
    .pipe(ttf2woff2())
    .pipe(dest("dev/fonts"));
}

function fontsDev() {
  return src(["#src/fonts/**/*"])
    .pipe(dest("dev/fonts"));
}

function cleanDev() {
  return del([
    "dev/**/*"
  ]);
}

function watchDev() {
  watch(["#src/components/**/*.html", "#src/views/*.html"], htmlDev);
  watch(["#src/scss/**/*.scss", "#src/components/**/*.scss"], styleDev);
  watch(["#src/js/**/*.js", "!#src/js/vendors/**/*.js"], jsDev);
  watch(["#src/img/**/*"], imagesDev);
  watch(["dev/index.html"]).on("change", browserSync.reload);
}

exports.htmlDev = htmlDev;
exports.styleDev = styleDev;
exports.styleVendorsDev = styleVendorsDev;
exports.jsDev = jsDev;
exports.jsVendorsDev = jsVendorsDev;
exports.imagesDev = imagesDev;
exports.otf2ttfDev = otf2ttfDev;
exports.ttf2woff2Dev = ttf2woff2Dev;
exports.fontsDev = fontsDev;
exports.cleanDev = cleanDev;
exports.browsersyncDev = browsersyncDev;
exports.watchDev = watchDev;

exports.dev = parallel(
  cleanDev,
  htmlDev,
  styleDev,
  styleVendorsDev,
  jsDev,
  jsVendorsDev,
  imagesDev,
  ttf2woff2Dev,
  fontsDev,
  browsersyncDev,
  watchDev
);
/** *****************
 * TODO: IF THERE ARE PROBLEMS - npm cache clean --force
 * ******************
 */
