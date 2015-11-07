/**
 * 利用sugar异步创建一个模块
 */

require(['../../sugar'], function(sugar) {
	var $ = sugar.jquery;

	// 模块配置参数(也可在模块init中定义)
	var config = {
		// 模块目标容器
		'target': $('body')
	};


	/**
	 * 异步创建main.js模块到body中
	 * 异步创建就不需要像demo1一样在同一环境下定义模块
	 */
	sugar.core.createAsync('mainPage', 'page', config, function(mod) {
		// 模块创建成功后的回调函数
		console.log('模块mainPage创建成功：', mod);
	});
});