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
const ttf2eot = require("gulp-ttf2eot");
const fonter = require("gulp-fonter");

//! MODE PRODUCTION START
function html() {
  return src("dev/*.html").pipe(dest("docs"));
}

function style() {
  return src("dev/css/style.css").pipe(dest("docs/css"));
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
    .pipe(dest("docs/css"));
}

function styleVendors() {
  return src(["dev/css/vendors/**/*.css"]).pipe(dest("docs/css/vendors/"));
}

function js() {
  return src(["#src/js/**/*.js", "!#src/js/vendors/**/*.js"]).pipe(
    dest("docs/js")
  );
}

function jsMin() {
  return src(["dev/js/**/*.js", "!dev/js/vendors/**/*.js"])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(
      rename(function (path) {
        path.basename += ".min";
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest("docs/js"));
}

function jsVendors() {
  return src(["dev/js/vendors/**/*.js"]).pipe(dest("docs/js/vendors/"));
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
    .pipe(dest("docs/img"));
}

function fonts() {
  return src("dev/fonts/**/*").pipe(dest("docs/fonts"));
}

function cleanDist() {
  return del("docs/**/*");
}

exports.html = html;
exports.style = style;
exports.styleMin = styleMin;
exports.styleVendors = styleVendors;
exports.js = js;
exports.jsMin = jsMin;
exports.jsVendors = jsVendors;
exports.images = images;
exports.fonts = fonts;
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
  fonts
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
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
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

function ttf2woffDev() {
  return src(["#src/fonts/**/*.ttf"]).pipe(ttf2woff()).pipe(dest("dev/fonts"));
}

function ttf2woff2Dev() {
  return src(["#src/fonts/**/*.ttf"]).pipe(ttf2woff2()).pipe(dest("dev/fonts"));
}

function ttf2eotDev() {
  return src(["#src/fonts/**/*.ttf"]).pipe(ttf2eot()).pipe(dest("dev/fonts"));
}

function fontsDev() {
  return src(["#src/fonts/**/*.ttf"]).pipe(dest("dev/fonts"));
}

function cleanDev() {
  return del(["dev/**/*"]);
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
exports.ttf2woffDev = ttf2woffDev;
exports.ttf2woff2Dev = ttf2woff2Dev;
exports.ttf2eotDev = ttf2eotDev;
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
  //otf2ttfDev,
  ttf2woffDev,
  ttf2woff2Dev,
  //ttf2eotDev,
  //fontsDev,
  browsersyncDev,
  watchDev
);
/** *****************
 * TODO: IF THERE ARE PROBLEMS - npm cache clean --force
 * ******************
 */
