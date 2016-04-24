/**
 * webpack for mvvm.min config
 */

var webpack = require('webpack');
var banner = require('./banner').svm;

module.exports = {
	'entry' : './src/svm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'SVM',
		'filename'     : 'svm.min.js',
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