/**
 * webpack for vm.min config
 */

var webpack = require('webpack');
var banner = require('./banner').vm;

module.exports = {
	'entry' : './src/vm/index',
	'output': {
		'path'         : './dist',
		'library'      : 'VM',
		'filename'     : 'vm.min.js',
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