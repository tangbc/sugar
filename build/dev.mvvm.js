// webpack config for develop mvvm.js
var baseConfig = require('./dev.sugar');

module.exports = Object.assign(baseConfig, {
	entry : './src/mvvm/index',
	output: {
		path: './bundle',
		library: 'MVVM',
		filename: 'mvvm.js',
		libraryTarget: 'umd'
	}
});
