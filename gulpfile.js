var gulp = require('gulp');
// js语法检测
var jshint = require('gulp-jshint');

// 监听的js文件
var jsFiles = ['src/*.js', 'src/main/*.js', 'src/mvvm/*.js'];

// js语法检测配置
var jshintConfig = {
	'asi'      : true,
	'curly'    : true,
	'latedef'  : true,
	'forin'    : false,
	'noarg'    : false,
	'sub'      : true,
	'undef'    : true,
	'unused'   : 'vars',
	'boss'     : true,
	'eqnull'   : true,
	'browser'  : true,
	'laxcomma' : true,
	'devel'    : true,
	'smarttabs': true,
	// Avoid warning The '__proto__' property is deprecated.
	'proto'    : true,
	'predef'   : ['module', 'require', 'define']
}

gulp.task('jshint', function() {
	gulp.src(jsFiles)
		.pipe(jshint(jshintConfig))
		.pipe(jshint.reporter('default'));
});

// gulp start 开启任务监听
gulp.task('start', function() {
	// 初始化时开启一次
	gulp.run('jshint');

	// 监听js文件变化
	gulp.watch(jsFiles, function() {
		gulp.run('jshint');
	});
});
