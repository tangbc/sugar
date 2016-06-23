// Use Karma to generate code coverage.
// https://github.com/karma-runner/karma-coverage
var path = require('path');

module.exports = function(config) {
	config.set({
		// src and test files
		'files': [
			// '../src/*.js',
			// '../src/**/*.js',
			'../test/units/specs/*.js',
			'../test/units/specs/**/*.js'
		],

		'frameworks': ['jasmine'],

		// coverage reporter generates the coverage
		'reporters': ['progress', 'coverage'],

		'preprocessors': {
			// source files, that you wanna generate coverage for
			// do not include tests or libraries
			// (these files will be instrumented by Istanbul)
			'../src/*.js': ['webpack', 'sourcemap', 'coverage'],
			'../src/**/*.js': ['webpack', 'sourcemap', 'coverage'],
			'../test/units/specs/*.js': ['webpack', 'sourcemap'],
			'../test/units/specs/**/*.js': ['webpack', 'sourcemap'],
		},

		// optionally, configure the reporter
		'coverageReporter': {
			'dir': '../coverage/',
			'reporters': [
				{'type': 'lcov', 'subdir': '.' },
				{'type': 'text-summary', 'subdir': '.' }
			]
		},

		'webpack': {
			'devtool': 'inline-source-map',
			'resolve': {
				'alias': {
					'src': path.resolve(__dirname, '../src'),
					'mvvm': path.resolve(__dirname, '../src/mvvm/index')
				}
			},
			'module': {
				'preLoaders': [{
					'test': /\.js$/,
					'exclude': [/node_modules/,/\.Spec.js$/],
					'loader': 'istanbul-instrumenter-loader'
				}]
			}
		},

		'webpackServer': {
			'noInfo': true // prevent console spamming when running in Karma!
		},

		// 'plugins': [
		// 	'karma-jasmine',
		// 	'karma-chrome-launcher',
		// 	'karma-webpack',
		// 	'karma-sourcemap-loader',
		// 	'karma-coverage'
		// ],

		// enable / disable colors in the output (reporters and logs)
		'colors': true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		'logLevel': config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		'autoWatch': false,

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		'singleRun': true
	});
}