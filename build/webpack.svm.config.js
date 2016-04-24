/**
 * webpack for vm config
 */

var webpack = require('webpack');
var banner = require('./banner').svm;

module.exports = {
	'entry' : './src/svm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'SVM',
		'filename'     : 'svm.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.BannerPlugin(banner, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}