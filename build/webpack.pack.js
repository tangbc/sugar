/**
 * webpack config file
 * https://github.com/webpack/webpack/tree/master/examples/multi-compiler
 */

var webpack = require('webpack');
var banner = require('./banner');

// https://github.com/mishoo/UglifyJS2#compressor-options
// http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
var uglifyConifg = {
	'compress': {
		'warnings': false
	}
}
// http://webpack.github.io/docs/list-of-plugins.html#bannerplugin
var bannerConfig = {
	'raw'      : false,
	'entryOnly': false
}
// https://github.com/babel/babel-loader
var babelLoader = {
	'test': /\.js$/,
	'exclude': /(node_modules|bower_components)/,
	'loader': 'babel', // 'babel-loader' is also a legal name to reference
	'query': {
		'presets': ['es2015']
	}
}


var mvvm = {
	'entry' : './src/mvvm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'MVVM',
		'filename'     : 'mvvm.js',
		'libraryTarget': 'umd'
	},
	'module': {
		'loaders': [babelLoader]
	},
	'plugins': [
		new webpack.BannerPlugin(banner.mvvm, bannerConfig)
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
	'module': {
		'loaders': [babelLoader]
	},
	'plugins': [
		new webpack.optimize.UglifyJsPlugin(uglifyConifg),
		new webpack.BannerPlugin(banner.mvvm, bannerConfig)
	]
}

var sugar = {
	'entry' : './src/main/index',
	'output': {
		'path'         : './dist',
		'library'      : 'Sugar',
		'filename'     : 'sugar.js',
		'libraryTarget': 'umd'
	},
	'module': {
		'loaders': [babelLoader]
	},
	'plugins': [
		new webpack.BannerPlugin(banner.sugar, bannerConfig)
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
	'module': {
		'loaders': [babelLoader]
	},
	'plugins': [
		new webpack.optimize.UglifyJsPlugin(uglifyConifg),
		new webpack.BannerPlugin(banner.sugar, bannerConfig)
	]
}


module.exports = [mvvm, mvvmUglify, sugar, sugarUglify];
