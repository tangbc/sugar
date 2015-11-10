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
			// 模块初始化时允许无任何自定义配置
			// config = sugar.cover(config, {
			// 	'class': 'mainPage'
			// });
			this.Super('init', arguments);
		},

		/**
		 * 模块视图渲染完成回调
		 * 未在init中指定cbRender默认调用viewReady
		 */
		viewReady: function() {
			// 模块DOM节点
			var dom = this.getDOM();

			// 在渲染完毕后添加HTML结构也是可以的
			dom.html([
				'<h1>demo2：异步创建一个模块</h1>',
				'<h3>轻量、易用、API简单的sugar.js适用于构建模块化和组件化的web应用。</h3>',
				'<h3>',
					'其他3个例子：',
					'<a style="margin-left: 20px;" href="../demo1/">demo1</a>',
					'<a style="margin-left: 20px;" href="../demo3/">demo3</a>',
					'<a style="margin-left: 20px;" href="../demo4/">demo4</a>',
				'</h3>',
				'<hr/>',
				'<dl>',
					'<dt>这个页面是利用sugar异步创建的一个简单的模块：</dt>',
					'<dd>创建方式：sugar.core.createAsync(name模块名称, uri模块实例路径或别名, config模块配置, callback模块创建完成后的回调函数)</dd>',
				'</dl>',
				'<hr/>',
				'<dl>',
					'<dt>在主模块创建完成后也可以按需创建/销毁子模块：</dt>',
					'<dd class="createBtns">',
						'<a data-name="sub-a" data-uri="sub_a" class="citem" style="margin-left: 40px;">点击创建子模块A</a>',
						'<a data-name="sub-b" data-uri="sub_b" class="citem" style="margin: 0 125px;">点击创建子模块B</a>',
						'<a data-name="sub-c" data-uri="sub_c" class="citem">点击创建子模块C</a>',
					'</dd>',
					'<dd class="wraper">',
						'<div class="box sub-a"/>',
						'<div class="box sub-b"/>',
						'<div class="box sub-c"/>',
					'</dd>',
					'<dd class="destroyBtns">',
						'<a data-name="sub-a" class="ditem" style="margin-left: 40px;">点击销毁子模块A</a>',
						'<a data-name="sub-b" class="ditem" style="margin: 0 125px;">点击销毁子模块B</a>',
						'<a data-name="sub-c" class="ditem">点击销毁子模块C</a>',
					'</dd>',
				'</dl>'
			].join(''));

			// 绑定创建子模块点击事件，用代理事件完成(封装jquery的on方法)
			this.proxy(dom.find('.createBtns'), 'click', 'a', this.eventCreateSubs);

			// 绑定销毁子模块点击事件，用代理事件完成(封装jquery的on方法)
			this.proxy(dom.find('.destroyBtns'), 'click', 'a', 'eventDestroySubs');
		},

		/**
		 * 点击创建指定子模块
		 * @param   {Object}  evt  [事件对象]
		 * @param   {Object}  elm  [事件触发元素]
		 */
		eventCreateSubs: function(evt, elm) {
			// 获取定义子模块的名称
			var name = $(elm).attr('data-name');

			// 获取子模块的路径/别名
			var uri = $(elm).attr('data-uri');

			// 子模块创建的目标容器
			var target = this.getDOM('.' + name);

			// 调用getChild方法获取/检查子模块是否已经创建过
			var sub = this.getChild(name);

			if (sub) {
				alert('子模块'+ name +'已经存在了！');
			}
			else {
				this.createAsync(name, uri, {
					'target': target
				}, function(mod) {
					mod.showSuccess();
				});
			}
		},

		/**
		 * 点击销毁指定子模块
		 * @param   {Object}  evt  [事件对象]
		 * @param   {Object}  elm  [事件触发元素]
		 */
		eventDestroySubs: function(evt, elm) {
			// 获取定义子模块的名称
			var name = $(elm).attr('data-name');

			// 调用getChild方法获取/检查子模块是否已经创建过
			var sub = this.getChild(name);

			if (!sub) {
				alert('子模块'+ name +'还没有被创建！');
			}
			else {
				// 直接调用模块自身销毁方法即可销毁
				sub.destroy();
			}
		},

		/**
		 * 接收子模块发送的消息
		 * @param   {Object}  ev  [消息对象]
		 */
		onMessageSendBySubs: function(ev) {
			// 消息参数（内容）
			var param = ev.param;
			alert(param.message);

			// 返回false不再继续冒泡这条消息，到此被拦截
			// 否则将继续逐层往上触发父模块的onMessageSendBySubs方法
			return false;
		},

		/**
		 * 打印信息
		 */
		showSuccess: function() {
			console.log('异步创建模块mainPage成功：', this);
		}
	});
});