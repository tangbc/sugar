var path = require('path');

// karma-webpack config
var webpackConfig = {
	devtool: 'source-map',
	resolve: {
		alias: {
			src: path.resolve(__dirname, '../src'),
			mvvm: path.resolve(__dirname, '../src/mvvm/index')
		}
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: [
					path.resolve(__dirname, '../test/units'),
					path.resolve(__dirname, '../node_modules')
				],
				loader: 'babel', // 'babel-loader' is also a legal name to reference
				query: {
					presets: ['es2015']
				}
			}
		]
	}
}

// karma base config
var karmaBase = {
	// base path, that will be used to resolve files and exclude
	basePath: '../test/',

	// frameworks to use
	frameworks: ['jasmine'],

	// start these browsers, currently available:
	// - Chrome
	// - ChromeCanary
	// - Firefox
	// - Opera (has to be installed with `npm install karma-opera-launcher`)
	// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
	// - PhantomJS
	// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
	// browsers: ['Chrome'],

	// test results reporter to use
	// possible values: 'spec', 'dots', 'progress', 'coverage'
	// reprters: [],

	// list of files to load in the browser
	files: [
		'./units/index.js'
	],

	// Continuous Integration mode
	// if true, it capture browsers, run tests and exit
	singleRun: true,

	// list of preprocessors
	preprocessors: {
		'./units/index.js': ['webpack', 'sourcemap']
	},

	// webpack config
	// webpack: {},

	// webpack middleware config, not show bundle status
	webpackMiddleware: {
		noInfo: true
	}
}

// unit test config
var testConfig = Object.assign({}, karmaBase, {
	browsers: ['Chrome'],
	// browsers: ['Firefox'],
	// browsers: ['Safari'],
	webpack: webpackConfig,
	reprters: ['progress']
});

// istanbul loader for webpack config
var coverWebpackConfig = Object.assign({}, webpackConfig);
coverWebpackConfig.module.postLoaders = [
	{
		test: /\.js$/,
		exclude: /test|node_modules/,
		loader: 'istanbul-instrumenter'
	}
];
var coverConfig = Object.assign({}, karmaBase, {
	browsers: ['PhantomJS'],
	webpack: coverWebpackConfig,
	reporters: ['spec', 'coverage'],
	coverageReporter: {
		reporters: [
			{type: 'text-summary', subdir: '.'},
			{type: 'lcov', subdir: '.', dir: 'coverage/'}
		]
	}
});

module.exports = {
	test: testConfig,
	cover: coverConfig
}
