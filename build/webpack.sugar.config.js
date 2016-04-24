/**
 * webpack for sugar config
 */

var webpack = require('webpack');
var banner = require('./banner').sugar;

module.exports = {
	'entry' : './src/main/index',
	'output': {
		'path'         : './dist',
		'library'      : 'Sugar',
		'filename'     : 'sugar.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.BannerPlugin(banner, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}