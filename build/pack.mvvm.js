import buble from 'rollup-plugin-buble';
import { mvvmBanner } from './banner';

export default {
	'entry': './src/mvvm/index.js',
	'dest': './dist/mvvm.js',
	'format': 'umd',
	'moduleName': 'MVVM',
	'banner': mvvmBanner,
	'plugins': [
		buble()
	]
}