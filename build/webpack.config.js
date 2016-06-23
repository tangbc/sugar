/**
 * webpack config file
 * multi-complier example here:
 * https://github.com/webpack/webpack/tree/master/examples/multi-compiler
 */

var webpack = require('webpack');
var banner = require('./banner');

var sugar = {
	'entry' : './src/main/index',
	'output': {
		'path'         : './dist',
		'library'      : 'Sugar',
		'filename'     : 'sugar.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.BannerPlugin(banner.sugar, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}

var sugarUglify = {
	'entry' : './src/main/index',
	'output': {
		'path'         : './dist',
		'library'      : 'Sugar',
		'filename'     : 'sugar.min.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		// https://github.com/mishoo/UglifyJS2#compressor-options
		// http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
		new webpack.optimize.UglifyJsPlugin({
			'compress': {
				'warnings': false
			}
		}),
		// http://webpack.github.io/docs/list-of-plugins.html#bannerplugin
		new webpack.BannerPlugin(banner.sugar, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}

var mvvm = {
	'entry' : './src/mvvm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'MVVM',
		'filename'     : 'mvvm.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.BannerPlugin(banner.mvvm, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}

var mvvmUglify = {
	'entry' : './src/mvvm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'MVVM',
		'filename'     : 'mvvm.min.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.optimize.UglifyJsPlugin({
			'compress': {
				'warnings': false
			}
		}),
		new webpack.BannerPlugin(banner.mvvm, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}

module.exports = [sugar, sugarUglify, mvvm, mvvmUglify];
