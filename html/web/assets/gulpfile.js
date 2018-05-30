var css_src  = 'postcss/*.css';
var css_dest = 'css/';

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker     = require('css-mqpacker');
var notify       = require("gulp-notify");
var reporter     = require('postcss-reporter');
var syntax_scss  = require('postcss-scss');
var stylelint    = require('stylelint');
var cleanCSS = require('gulp-clean-css');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var stylelintConfig    = require('./stylelint');

global.env  = process.argv.indexOf('--production') !== -1 ? 'production' : 'development';

gulp.task("css-lint", function() {
    var processors = [
        stylelint(stylelintConfig),
        reporter({
            clearMessages: true,
            throwError   : false
        })
    ];

    return gulp.src(
        [
            './sass/**/*.scss',
            '!./sass/style.scss',
            '!./sass/sp-style.scss'
        ]
    )
        .pipe(postcss(processors, {syntax: syntax_scss}))
        .on("error", notify.onError({
            message: "Error: <%= error.message %>",
            title  : "Build Sass Error"
        }));
});

gulp.task('sass', function() {
    gulp.start('css-lint')
        .src('sass/**/*.scss')
        .pipe(gulpif(global.env !== 'production', sourcemaps.init()))
        .pipe(sass({style: 'expanded'})
            .on("error", notify.onError({
                message: "Error: <%= error.message %>",
                title  : "Build Sass Error"
            })))
        .pipe(gulpif(global.env !== 'production', sourcemaps.write()))
        .pipe(gulp.dest('./postcss'));
});

gulp.task('css', function() {
    var plugins = [
        autoprefixer({browsers: ['> 1%', 'last 2 versions']}),
        mqpacker
    ];

    return gulp.src(css_src)
        .pipe(gulpif(global.env !== 'production', sourcemaps.init()))
        .pipe(postcss(plugins))
        .pipe(gulpif(global.env === 'production', cleanCSS()))
        .pipe(gulpif(global.env !== 'production', sourcemaps.write()))
        .pipe(gulp.dest(css_dest));
});

gulp.task('watch', function() {
    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch(css_src, ['css']);
});

gulp.task('build', ['sass', 'css'], function() {
    gulp.src(['./sass']).pipe(notify({
        message: "Build " + global.env,
        title  : "Build successful!"
    }));
});

gulp.task('default', ['watch']);
