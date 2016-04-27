/**
 * webpack for vm config
 */

var webpack = require('webpack');
var banner = require('./banner').mvvm;

module.exports = {
	'entry' : './src/mvvm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'MVVM',
		'filename'     : 'mvvm.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.BannerPlugin(banner, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}