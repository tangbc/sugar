import buble from 'rollup-plugin-buble';
import { sugarBanner } from './banner';

export default {
	'entry': './src/main/index.js',
	'dest': './dist/sugar.js',
	'format': 'umd',
	'moduleName': 'Sugar',
	'banner': sugarBanner,
	'plugins': [
		buble()
	]
}