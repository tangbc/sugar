var gulp = require('gulp');
var jshint = require('gulp-jshint');

// 监听的 js 文件目录
var jsFiles = [
	'src/*.js',
	'src/main/*.js',
	'src/mvvm/*.js',
	'src/mvvm/parsers/*.js'
];

// js 语法检测配置
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
	// Aviod warning The Function constructor is a form of eval.
	'evil'     : true,
	// Avoid warning The '__proto__' property is deprecated.
	'proto'    : true,
	// available in es6
	'esversion': 6,
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
	gulp.start('jshint');

	// 监听 js 文件变化
	gulp.watch(jsFiles, function() {
		gulp.start('jshint');
	});
});
