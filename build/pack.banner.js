/**
 * banner description
 */

var date = Date();
var regFristNewline = /\n/;
var year = (new Date()).getFullYear();
var version = require('../package.json').version;

function getBanner (library) {
	return `
/*!
 * ${library} v${version} (c) ${year} TANG
 * Released under the MIT license
 * ${date}
 */`
}

var outputConfig = {
	comments: function (node, comment) {
		// multiline comment
		return comment.type === 'comment2' && /TANG/i.test(comment.value);
	}
}

var mvvmBanner = getBanner('mvvm.js').replace(regFristNewline, '');
var sugarBanner = getBanner('sugar.js').replace(regFristNewline, '');


export { mvvmBanner, sugarBanner, outputConfig }
