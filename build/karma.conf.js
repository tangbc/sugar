var path = require('path');

/**
 * karma-webpack config
 */
var webpackConfig = {
	devtool: '#inline-source-map',
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
					path.resolve(__dirname, '../node_modules')
				],
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
		]
	}
}

/**
 * karma base/common config
 */
var KARMABASE = {
	// base path
	basePath: '../test/',

	// frameworks to use
	frameworks: ['jasmine'],

	// launch browsers (declare in specific case)
	// browsers: ['Chrome'],

	// result reporters (declare in specific case)
	// reporters: [],

	// karma-webpack config (declare in specific case)
	// webpack: {},

	// list of files to load in the browser
	files: ['./units/index.js'],

	// continuous integration mode
	singleRun: true,

	// list of preprocessors before test
	preprocessors: {
		'./units/index.js': ['webpack', 'sourcemap']
	},

	// webpack middleware config
	webpackMiddleware: {
		noInfo: true
	}
}


/**
 * unit test config
 */
var UNITCONIG = Object.assign({}, KARMABASE, {
	// browsers: ['Chrome'],
	// browsers: ['Firefox'],
	// browsers: ['Safari'],
	browsers: ['Chrome', 'Firefox', 'Safari'],
	webpack: webpackConfig,
	reporters: ['progress']
});


// webpack config for istanbul loader
var coverWebpackConfig = Object.assign({}, webpackConfig);
coverWebpackConfig.module.postLoaders = [
	{
		test: /\.js$/,
		exclude: /test|node_modules/,
		loader: 'istanbul-instrumenter'
	}
];

/**
 * coverage report config
 */
var COVERCONFIG = Object.assign({}, KARMABASE, {
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


// create an object for a customLauncher about sauceLabs
function createCustomLauncher (browser, platform, version) {
	return {
		base: 'SauceLabs',
		browserName: browser,
		platform: platform,
		version: version
	};
}

// browsers to run on Sauce Labs
// check out https://saucelabs.com/platforms for all browser/OS combos
var customLaunchers = {
	// Modern browsers
	sl_win_chrome: createCustomLauncher('chrome', 'Windows 7'),
	sl_mac_chrome: createCustomLauncher('chrome', 'OS X 10.10'),

	sl_win_firefox: createCustomLauncher('firefox', 'Windows 7'),
	sl_mac_firefox: createCustomLauncher('firefox', 'OS X 10.10'),

	sl_mac_safari: createCustomLauncher('safari', 'OS X 10.11'),

	// Mobile side
	sl_ios_8_safari: createCustomLauncher('iphone', null, '8.4'),
	sl_ios_9_safari: createCustomLauncher('iphone', null, '9.3'),
	sl_android_4_2: createCustomLauncher('android', null, '4.2'),
	sl_android_5_1: createCustomLauncher('android', null, '5.1'),

	// Microsoft Edge
	sl_edge: createCustomLauncher('MicrosoftEdge', 'Windows 10'),

	// Internet explorer
	sl_ie_9: createCustomLauncher('internet explorer', 'Windows 7', '9'),
	sl_ie_10: createCustomLauncher('internet explorer', 'Windows 8', '10'),
	sl_ie_11: createCustomLauncher('internet explorer', 'Windows 10', '11')
};

/**
 * sauceLabs config
 */
var maxExecuteTime = 5*60*1000;
var SAUCECONFIG = Object.assign({}, KARMABASE, {
	sauceLabs: {
		public: 'public',
		recordVideo: false,
		recordScreenshots: false,
		testName: 'sugar unit test',
		build: process.env.TRAVIS_JOB_ID || 'build-' + Date.now()
	},
	customLaunchers: customLaunchers,
	browsers: Object.keys(customLaunchers),
	captureTimeout: maxExecuteTime,
	browserNoActivityTimeout: maxExecuteTime,
	webpack: webpackConfig,
	reporters: ['progress', 'saucelabs']
});


// output the unit, cover, sauceLabs karma config
module.exports = {
	unit: UNITCONIG,
	cover: COVERCONFIG,
	sauce: SAUCECONFIG
}
