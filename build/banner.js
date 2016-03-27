/**
 * banner description
 */

var year = (new Date()).getFullYear();
var version = require('../package.json').version;

module.exports = {
	'sugar': [
		'sugar.js v' + version,
		'(c) ' + year + ' TANG',
		'https://github.com/tangbc/sugar',
		'released under the MIT license.'
	].join('\n'),

	'vm': [
		'vm.js',
		'mvvm library for sugar',
		'(c) ' + year + ' TANG',
		'this library can be used independently (without sugar)',
		'https://github.com/tangbc/sugar',
		'released under the MIT license.'
	].join('\n')
}