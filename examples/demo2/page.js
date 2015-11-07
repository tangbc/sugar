/**
 * demo2的page页面主模块
 */

define(['page'], function() {
	var sugar = require('../../sugar');
	var $ = sugar.jquery;

	/**
	 * 定义页面模块
	 */
	return sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'class': 'mainPage',
				'html' : [
					'<h1>欢迎使用sugar.js！</h1>',
					'<h3>轻量、易用、API简单的sugar.js适用于构建模块化和组件化的web应用。</h3>',
					'<hr/>',
					'<dl>',
						'<dt>这个页面是利用sugar异步创建的一个简单的模块：</dt>',
						'<dd>1、创建方式：sugar.core.createAsync(name模块名称, uri模块实例路径或别名, config模块配置, callback模块创建完成后的回调函数)</dd>',
					'</dl>'
				].join('')
			});
			this.Super('init', arguments);
		},

		/**
		 * 模块视图渲染完成回调
		 * 未在init中指定cbRender默认调用viewReady
		 */
		viewReady: function() {
			//
		}
	});
});