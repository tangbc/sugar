/**
 * webpack for vm config
 */

var webpack = require('webpack');
var banner = require('./banner').vm;

module.exports = {
	'entry' : './src/vm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'VM',
		'filename'     : 'vm.js',
		'libraryTarget': 'umd'
	},
	'plugins': [
		new webpack.BannerPlugin(banner, {
			'raw'      : false,
			'entryOnly': false
		})
	]
}