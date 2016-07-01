// Use Karma to generate test code coverage.
// https://github.com/karma-runner/karma-coverage
var path = require('path');

module.exports = function(config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		'basePath': '',

		// frameworks to use
		'frameworks': ['jasmine'],

		// start these browsers
		'browsers': ['PhantomJS'],

		// list of files to load in the browser
		'files': [
			'../test/units/index.js'
		],

		// list of preprocessors
		'preprocessors': {
			'../test/units/index.js': ['webpack']
		},

		// test results reporter to use
		// possible values: 'spec', 'dots', 'progress', 'junit', 'growl', 'coverage'
		'reporters': ['progress', 'coverage'],

		// set coverage report type and generate path
		'coverageReporter': {
			'dir': '../test/coverage/',
			'reporters': [
				{'type': 'lcov', 'subdir': '.'},
				{'type': 'text-summary', 'subdir': '.'}
			]
		},

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		'singleRun': true,

		// webpack middleware config
		'webpackMiddleware': {
			'noInfo': true
		},

		// webpack config
		'webpack': {
			'devtool': 'inline-source-map',
			'resolve': {
				'alias': {
					'src': path.resolve(__dirname, '../src'),
					'mvvm': path.resolve(__dirname, '../src/mvvm/index')
				}
			},
			'module': {
				// coverage post loader
				'postLoaders': [
					{
						'test': /\.js$/,
						'exclude': /test|node_modules/,
						'loader': 'istanbul-instrumenter'
					}
				],
				'loaders': [
					{
						'test': /\.js$/,
						'exclude': [
							path.resolve(__dirname, '../test/units'),
							path.resolve(__dirname, '../node_modules')
						],
						'loader': 'babel', // 'babel-loader' is also a legal name to reference
						'query': {
							'presets': ['es2015']
						}
					}
				]
			}
		}
	});
}