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
	 * ******************************************
	 * 下一个示例demo5: 综合示例：多表单的信息填写页面 *
	 * ******************************************
	 */
});