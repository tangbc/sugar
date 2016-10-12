// webpack config for develop sugar.js
module.exports = {
	entry: './src/main/index',
	output: {
		path: './bundle',
		library: 'Sugar',
		filename: 'sugar.js',
		libraryTarget: 'umd'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel', // 'babel-loader' is also a legal name to reference
				query: {
					presets: ['es2015']
				}
			}
		]
	},
	devtool: 'source-map'
}
