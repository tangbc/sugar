/**
 * banner description
 */

var version = require('../package.json').version;
var released = 'released under the MIT license.';
var repository = 'https://github.com/tangbc/sugar';
var author = '(c) ' + (new Date()).getFullYear() + ' TANG';

module.exports = {
	'sugar': [
		'sugar.js v' + version,
		author,
		repository,
		released
	].join('\n'),
	'vm': [
		'mvvm.js',
		'mvvm library for sugar',
		author,
		'this library can be used independently (without sugar)',
		repository,
		released
	].join('\n')
}