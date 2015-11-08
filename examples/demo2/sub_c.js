/**
 * demo2的子模块sub_c
 */

define(['sub_c'], function() {
	var sugar = require('../../sugar');
	var $ = sugar.jquery;

	/**
	 * 定义sub_c模块
	 */
	var SubC = sugar.Container.extend({
		init: function(config) {
			config = sugar.cover(config, {
				'tag'  : 'span',
				'class': 'sub_c',
				'css'  : {'color': 'blue'},
				'html' : [
					'<h4>这是在demo2/sub_c.js中定义的子模块C</h4>',
					'<h5>同样子模块也可与父模块进行消息通信，通常用于子模块状态或者数据发生变化时通知父模块作出相应处理。<h5>',
					'<div class="sendMsg" style="text-decoration: underline;cursor: pointer;">点击向父模块发送消息</div>'
				].join('')
			});
			this.Super('init', [config]);
		},

		viewReady: function() {
			// 绑定点击发送消息事件，注意：即使注册的是匿名函数，执行环境依然是当前的this
			this.bind(this.getDOM('.sendMsg'), 'click', function() {
				// 消息内容
				var msg = {
					'message': '这是子模块C给父模块的一条消息，请查收~'
				};

				// 冒泡形式向父模块发送消息用 fire(method, param)
				// 在父模块要定义onMessageSendBySubs来接受这个消息
				this.fire('messageSendBySubs', msg);
			});
		},

		showSuccess: function() {
			console.log('异步创建模块sub_c成功：', this);
		}
	});

	return SubC;
});