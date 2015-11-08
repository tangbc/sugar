/**
 * 利用模板和MVVM构建模块布局
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
	 * ******************************
	 * 下一个示例demo4: 模块的复用与继承 *
	 * ******************************
	 */
});