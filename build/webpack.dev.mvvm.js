// webpack config file for develop mvvm.js

var baseConfig = require('./webpack.dev.sugar');

module.exports = Object.assign(baseConfig, {
	'entry' : './src/mvvm/index',
	'output': {
		'path': './bundle',
		'library': 'MVVM',
		'libraryTarget': 'umd',
		'filename': 'mvvm.js'
	}
});