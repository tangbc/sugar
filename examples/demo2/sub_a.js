/**
 * demo2的子模块sub_a
 */

define(['sub_a'], function() {
	var sugar = require('../../sugar');
	var $ = sugar.jquery;

	/**
	 * 定义sub_c模块
	 */
	var SubA = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'tag'  : 'span',
				'class': 'sub_a',
				'css'  : {'color': 'red'},
				'html' : [
					'<h4>这是在demo2/sub_a.js中定义的子模块A</h4>',
					'<h5>子模块也是通过Container类创建的，并且与同级的其他子模块相互独立互不影响。<h5>'
				].join('')
			});
			this.Super('init', [config]);
		},

		showSuccess: function() {
			console.log('异步创建模块sub_a成功：', this);
		}
	});

	return SubA;
});