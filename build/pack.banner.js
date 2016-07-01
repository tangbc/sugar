/**
 * banner description
 */
var mvvmBanner, sugarBanner;
var version = require('../package.json').version;
var description = [
	'/*!',
	undefined,
	' * (c) ' + (new Date()).getFullYear() + ' TANG',
	' * Released under the MIT license',
	' * https://github.com/tangbc/sugar',
	' * ' + Date(),
	' */'
];

description[1] = ' * mvvm.js v' + version;
mvvmBanner = description.join('\n');

description[1] = ' * sugar.js v' + version;
sugarBanner = description.join('\n');

export { mvvmBanner, sugarBanner };