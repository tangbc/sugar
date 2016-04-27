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
	'mvvm': [
		'mvvm.js v' + version,
		author,
		repository,
		released
	].join('\n')
}