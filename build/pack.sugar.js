import buble from 'rollup-plugin-buble';
import { sugarBanner } from './pack.banner';

export default {
	'entry': './src/component/index.js',
	'dest': './dist/sugar.js',
	'format': 'umd',
	'moduleName': 'Sugar',
	'banner': sugarBanner,
	'plugins': [
		buble()
	]
}