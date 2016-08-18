// webpack config file for develop sugar.js

module.exports = {
	'entry': './src/main/index',
	'output': {
		'path': './bundle',
		'library': 'Sugar',
		'libraryTarget': 'umd',
		'filename': 'sugar.js'
	},
	'module': {
		'loaders': [
			{
				'test': /\.js$/,
				'exclude': /(node_modules|bower_components)/,
				'loader': 'babel', // 'babel-loader' is also a legal name to reference
				'query': {
					'presets': ['es2015']
				}
			}
		]
	},
	'devtool': 'source-map'
}