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
				loader: 'babel', // 'babel-loader' is also a legal name to reference
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
	// base path, that will be used to resolve files and exclude
	basePath: '../test/',

	// frameworks to use
	frameworks: ['jasmine'],

	// // start these browsers, currently available:
	// // - Chrome
	// // - ChromeCanary
	// // - Firefox
	// // - Opera (has to be installed with `npm install karma-opera-launcher`)
	// // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
	// // - PhantomJS
	// // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
	// browsers: ['Chrome'],

	// // test results reporter to use
	// // possible values: 'spec', 'dots', 'progress', 'coverage'
	// reporters: [],

	// // webpack config
	// webpack: {},

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

	// webpack middleware config, not show bundle status
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
	sl_chrome: createCustomLauncher('chrome', 'Windows 7'),
	sl_firefox: createCustomLauncher('firefox', 'Windows 7'),
	// sl_mac_safari: createCustomLauncher('safari', 'OS X 10.10'),
	// Microsoft Edge
	// sl_edge: createCustomLauncher('MicrosoftEdge', 'Windows 10'),
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
		recordScreenshots: false,
		testName: 'sugar.js sauceLabs test',
		build: Date.now()
	},
	customLaunchers: customLaunchers,
	captureTimeout: maxExecuteTime,
	browserNoActivityTimeout: maxExecuteTime,
	browsers: Object.keys(customLaunchers),
	webpack: webpackConfig,
	reporters: ['progress', 'saucelabs']
});


// output the unit, cover, sauceLabs karma config
module.exports = {
	unit: UNITCONIG,
	cover: COVERCONFIG,
	sauce: SAUCECONFIG
}
