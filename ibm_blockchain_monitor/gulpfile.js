///// Gulp Dependencies /////
var path = require('path');
var gulp = require('gulp');
var	sass = require('gulp-sass');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var bust = require('gulp-buster');
var spawn = require('child_process').spawn;
var uglify = require('gulp-uglify');
var stripComments = require('gulp-strip-comments');
var node, env = process.env;

////// Build Tasks ///////
gulp.task('build-sass', function () {							//concat css and build hash
	gulp.src(path.join(__dirname,'/scss/*.scss'))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.join(__dirname,'/scss/temp')))		//build them here first
		.pipe(concat('main.css'))								//concat them all
		.pipe(gulp.dest(path.join(__dirname, '/public/css')))	//dump orig
		.pipe(cleanCSS())										//minify
		.pipe(rename('main.min.css'))
		.pipe(gulp.dest(path.join(__dirname,'/public/css')))	//dump min
		.pipe(rename('singlecsshash'))
		.pipe(bust({fileName: 'busters_css.json'}))				//cache bust
		.pipe(gulp.dest('.'));									//dump hash
});

gulp.task('build-js-hash', function () {						//concat our js and build hash
	gulp.src([path.join(__dirname,'/public/js/*.js'), '!**/tab_apis.js', '!**/yeti_setup.js'])
		.pipe(concat('singlejshash'))
		//.pipe(uglify())
		.pipe(stripComments())
		.pipe(rename('main.js'))
		.pipe(gulp.dest(path.join(__dirname, '/public/js/concat')))
		.pipe(rename('busters_js'))
		.pipe(bust({fileName: 'busters_js.json'}))				//cache bust
		.pipe(gulp.dest('.'));									//dump hash
});

gulp.task('build-swagger-js', function () {						//concat swagger librarys
	gulp.src(path.join(__dirname,'/public/js/lib/swagger/*.js'))
		.pipe(concat('swagger_lib.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(path.join(__dirname, '/public/js/concat')));
});

gulp.task('build-js-libs', function () {						//concat js librarys
	gulp.src(path.join(__dirname,'/public/js/lib/*.js'))
		.pipe(concat('js_libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(path.join(__dirname, '/public/js/concat')));
});

////// Run Server Task ///////
gulp.task('server', function() {
	if(node) node.kill();
	node = spawn('node', ['app.js'], {env: env, stdio: 'inherit'});		//command, file, options
});

////// Watch Tasks //////
gulp.task('watch-sass', ['build-sass'], function () {
	gulp.watch(path.join(__dirname, '/scss/*.scss'), ['build-sass']);
});

gulp.task('watch-js', ['build-js-hash'], function () {
	gulp.watch(path.join(__dirname,'/public/js/*.js'), ['build-js-hash']);
});

gulp.task('watch-server', ['server'], function () {
	gulp.watch(path.join(__dirname, '/routes/**/*.js'), ['server']);
	gulp.watch(path.join(__dirname, '/libs/**/*.js'), ['server']);
	gulp.watch(path.join(__dirname, '/app.js'), ['server']);
});

////// Tasks //////
gulp.task('default', ['watch-sass', 'watch-server', 'watch-js', 'build-swagger-js', 'build-js-libs']);
gulp.task('local', ['setup_local', 'default']);
gulp.task('dev', ['setup_dev', 'default']);
gulp.task('staging', ['setup_staging', 'default']);
gulp.task('prod', ['setup_prod', 'default']);
gulp.task('yeti', ['setup_yeti', 'default']);

gulp.task('setup_local', function () {
	console.log('Lets DO This - LOCAL');
	var tmp = require(path.join(__dirname, '/env/local.json'));
	for(var i in tmp) env[i] = tmp[i];									//copy to environmental vars
});

gulp.task('setup_dev', function () {
	console.log('Lets Go - DEV');
	var tmp = require(path.join(__dirname, '/env/dev.json'));
	for(var i in tmp) env[i] = tmp[i];									//copy to environmental vars
});

gulp.task('setup_staging', function () {
	console.log('Lets Go - STAGING');
	var tmp = require(path.join(__dirname, '/env/staging.json'));
	for(var i in tmp) env[i] = tmp[i];									//copy to environmental vars
});

gulp.task('setup_prod', function () {
	console.log('Lets Go - PRODUCTION');
	var tmp = require(path.join(__dirname, '/env/prod.json'));
	for(var i in tmp) env[i] = tmp[i];									//copy to environmental vars
});

gulp.task('setup_yeti', function () {
	console.log('Lets Go - YETI - LOCAL');
	var tmp = require(path.join(__dirname, '/env_yeti/local.json'));
	for(var i in tmp) env[i] = tmp[i];									//copy to environmental vars
});
