/**
 * webpack for mvvm.min config
 */

var webpack = require('webpack');
var banner = require('./banner').vm;

module.exports = {
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
		new webpack.BannerPlugin(banner, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}