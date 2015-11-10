/**
 * 模块的复用与继承
 */

require(['../../sugar'], function(sugar) {
	var $ = sugar.jquery;

	/**
	 * 异步创建page.js定义的模块到body
	 */
	sugar.core.createAsync('main', 'page', {
		'target': $('body')
	});

	/*
	 * *******************************************
	 * 没有示例了,欢迎使用sugar,提建议和pull request  *
	 * https://github.com/tangbc/sugar           *
	 * *******************************************
	 */

});