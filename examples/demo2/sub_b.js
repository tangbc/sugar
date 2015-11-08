/**
 * demo2的子模块sub_b
 */

define(['sub_b'], function() {
	var sugar = require('../../sugar');
	var $ = sugar.jquery;

	/**
	 * 定义sub_c模块
	 */
	var SubB = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'tag'  : 'span',
				'class': 'sub_b',
				'css'  : {'color': 'green'},
				'html' : [
					'<h4>这是在demo2/sub_b.js中定义的子模块B</h4>',
					'<h5>在父模块可以通过getChild获取指定子模块实例，然后就可以调用子模块实例的所有方法以及读取子模块状态。<h5>'
				].join('')
			});
			this.Super('init', [config]);
		},

		showSuccess: function() {
			console.log('异步创建模块sub_b成功：', this);
		}
	});

	return SubB;
});