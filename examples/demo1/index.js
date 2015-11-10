/**
 * 利用sugar创建一个简单的模块化页面
 */

require(['../../sugar'], function(sugar) {
	var $ = sugar.jquery;

	/**
	 * 页面模块的定义
	 */
	var MainPage = sugar.Container.extend({
		/**
		 * 模块配置初始化方法，传入的配置参数将会覆盖父模块的配置参数
		 * @param   {Object}  config  [创建模块实例时传入的配置参数]
		 */
		init: function(config) {
			config = sugar.cover(config, {
				// 模块目标容器
				'target'  : null,
				// 模块的HTML标签
				'tag'     : 'div',
				// 模块的CSS(以jquery的css()方法设置)
				'css'     : {'text-shadow': '2px 2px 4px #C3C3C3'},
				// 模块的attr(以jquery的attr()方法设置)
				'attr'    : {'data-type': 'sugar-module'},
				// 模块的类名
				'class'   : 'mainPage',
				// 视图渲染完成后的回调函数
				'cbRender': 'afterRendered',
				// 模块的HTML布局，渲染时以jquery的html()将布局插入到模块的DOM节点
				'html'    : [
					'<h1>demo1：创建一个简单的模块化页面</h1>',
					'<h3>轻量、易用、API简单的sugar.js适用于构建模块化和组件化的web应用。</h3>',
					'<h3>',
						'其他3个例子：',
						'<a style="margin-left: 20px;" href="../demo2/">demo2</a>',
						'<a style="margin-left: 20px;" href="../demo3/">demo3</a>',
						'<a style="margin-left: 20px;" href="../demo4/">demo4</a>',
					'</h3>',
					'<hr/>',
					'<dl>',
						'<dt>这个页面是利用sugar同步创建的一个简单的模块：</dt>',
						'<dd>1、创建方式：sugar.core.create(name模块名称, Class模块类, config模块配置)</dd>',
					'</dl>'
				].join('')
			});

			// 调用父类(sugar.Container)的init方法，以完成页面的渲染
			// sugar.Container.init调用时会传入本模块的配置参数config
			this.Super('init', arguments);
		},

		/**
		 * 模块视图渲染完成回调
		 */
		afterRendered: function() {
			// 主模块的DOM对象
			var dom = this.getDOM();

			var dl = dom.find('dl');
			// 追加内容
			dl.append([
				'<dd>',
					'2、其中，多个模块时名称name不能重复，模块类Class是通过 <i>sugar.Module</i> 或 <i>sugar.Container</i> 继承而来，可以定义模块的布局内容和行为；模块配置config为模块创建时的配置参数)',
				'</dd>',
				'<dd>',
					'3、可以为视图模块内所有的元素绑定事件：比如点击事件 <a target="_blank" href="http://www.tangbc.com" class="click-test" style="color: blue; cursor: pointer;">点击再追加一行</a>',
				'</dd>'
			].join(''));

			// 为指定的节点绑定点击事件
			this.bind(dl.find('.click-test'), 'click', this.eventAddLine);
		},

		/**
		 * 点击事件的响应函数：在dl中追加一行文字，并阻止a标签默认的跳转
		 * @param   {Object}  evt  [事件对象]
		 * @param   {Object}  elm  [事件触发的DOM节点]
		 */
		eventAddLine: function(evt, elm) {
			// 获取dl的DOM节点
			var dl = this.getDOM('dl');

			// 追加一行
			$('<dd>'+ (dl.find('dd').length + 1) +'、这是点击追加的一行~~~</dd>').appendTo(dl);

			// 返回false将阻止默认事件和冒泡
			return false;
		},

		/**
		 * 打印模块的配置参数
		 */
		logModuleConfig: function() {
			// 获取模块的当前所有的配置参数
			var c = this.getConfig();
			console.log('模块的配置参数：', c);
		}
	});


	/**
	 * 将上面定义的主模块MainPage创建到body中：
	 * create方法为同步创建模块，要求模块的定义和创建必须在同一环境下。
	 */
	sugar.core.create('mainPage', MainPage, {
		'target': $('body')
	});


	/**
	 * 可以通过sugar.core.get(模块名)的方式获取模块实例，比如：
	 */
	var page = sugar.core.get('mainPage');

	/**
	 * 可以调用模块实例方法，比如：打印模块的配置参数
	 */
	page.logModuleConfig();


	/*
	 * *******************************************************
	 * 下一个示例demo2: 异步创建一个模块(sugar.core.createAsync) *
	 * *******************************************************
	 */
});