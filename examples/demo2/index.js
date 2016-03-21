/**
 * 利用sugar异步创建一个模块
 */

require(['../../src/index'], function(sugar) {
	var $ = sugar.jquery;

	// 模块配置参数(也可在模块init中定义)
	var config = {
		// 模块目标容器
		'target': document.querySelector('body');
	};

	/**
	 * 异步创建page.js定义的模块到body中
	 * 异步创建就不需要像demo1一样在同一环境下定义模块，只需指定模块路径或别名即可
	 */
	sugar.core.createAsync('mainPage', 'page', config, function(mod) {
		// 模块创建成功后的回调函数，可以调用模块实例的方法
		mod.showSuccess();
	});

	/*
	 * ***************************************
	 * 下一个示例demo3: 利用模板和MVVM构建模块布局 *
	 * ***************************************
	 */
});