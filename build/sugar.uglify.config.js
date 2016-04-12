/**
 * webpack for sugar.min config
 */

var webpack = require('webpack');
var banner = require('./banner').sugar;

module.exports = {
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
		new webpack.BannerPlugin(banner, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}