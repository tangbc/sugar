/**
 * 基础视图模块
 */
define([
	'../dom',
	'./ajax',
	'../util',
	'./module',
	'../mvvm/index'
], function(dom, ajax, util, Module, MVVM) {

	/**
	 * Container 视图基础模块
	 */
	var Container = Module.extend({
		/**
		 * init 模块初始化方法
		 * @param  {Object}  config  [模块参数配置]
		 * @param  {Object}  parent  [父模块对象]
		 */
		init: function(config, parent) {
			this._config = this.cover(config, {
				// 模块目标容器
				'target'  : null,
				// DOM元素的标签
				'tag'     : 'div',
				// 元素的class
				'class'   : '',
				// 元素的css
				'css'     : null,
				// 元素的attr
				'attr'    : null,
				// 视图布局内容
				'html'    : '',
				// 静态模板uri
				'template': '',
				// 模板拉取请求参数
				'tplParam': null,
				// mvvm数据模型对象
				'model'   : null,
				// 视图渲染完成后的回调函数
				'cbRender': 'viewReady',
				// 移除节点子模块标记
				'tidyNode': true
			});

			// 通用dom处理方法
			this.$ = dom;
			// 模块元素
			this.el = null;
			// mvvm对象
			this.vm = null;
			// 模块是否已经创建完成
			this._ready = false;

			// 调用渲染前函数
			if (util.isFunc(this.beforeRender)) {
				this.beforeRender();
			}

			// 拉取模板
			if (this.getConfig('template')) {
				this._loadTemplate();
			}
			else {
				this._render();
			}
		},

		/**
		 * 加载模板
		 */
		_loadTemplate: function() {
			var c = this.getConfig();
			var uri = c.template;
			var param = util.extend(c.tplParam, {
				'ts': +new Date()
			});

			ajax.load(uri, param, function(err, data) {
				var text;

				if (err) {
					text = err.status + ': ' + uri;
					util.error(err);
				}
				else {
					text = data.result;
				}

				this.setConfig('html', text);
				this._render();
			}, this);
		},

		/**
		 * 模块配置参数合并、覆盖
		 * @param  {Object}  child   [子类模块配置参数]
		 * @param  {Object}  parent  [父类模块配置参数]
		 * @return {Object}          [合并后的配置参数]
		 */
		cover: function(child, parent) {
			if (!util.isObject(child)) {
				child = {};
			}
			if (!util.isObject(parent)) {
				parent = {};
			}
			return util.extend(parent, child);
		},

		/**
		 * 获取模块配置参数
		 * @param  {String}  name  [参数字段名称，支持/层级]
		 */
		getConfig: function(name) {
			return this.config(this._config, name);
		},

		/**
		 * 设置模块配置参数
		 * @param {String}  name   [配置字段名]
		 * @param {Mix}     value  [值]
		 */
		setConfig: function(name, value) {
			return this.config(this._config, name, value);
		},

		/**
		 * 设置/读取配置对象
		 * @param  {Object}  cData  [配置对象]
		 * @param  {String}  name   [配置名称, 支持/分隔层次]
		 * @param  {Mix}     value  [不传为读取配置信息, null为删除配置, 其他为设置值]
		 * @return {Mix}            [返回读取的配置值]
		 */
		config: function(cData, name, value) {
			// 不传cData配置对象
			if (util.isString(cData) || arguments.length === 0) {
				value = name;
				name = cData;
				cData = {};
			}

			var udf, data = cData;
			var set = (value !== udf);
			var remove = (value === null);

			if (name) {
				var ns = name.split('/');
				while (ns.length > 1 && util.hasOwn(data, ns[0])) {
					data = data[ns.shift()];
				}
				if (ns.length > 1) {
					if (set) {
						return false;
					}
					if (remove)	{
						return true;
					}
					return udf;
				}
				name = ns[0];
			}
			else {
				return data;
			}

			if (set) {
				data[name] = value;
				return true;
			}
			else if (remove) {
				data[name] = null;
				delete data[name];
				return true;
			}
			else {
				return data[name];
			}
		},

		/**
		 * 渲染视图、初始化配置
		 */
		_render: function() {
			// 判断是否已创建过
			if (this._ready) {
				return this;
			}

			this._ready = true;

			var c = this.getConfig();

			var el = this.el = util.createElement(c.tag);

			// 添加class
			if (c.class && util.isString(c.class)) {
				dom.addClass(el, c.class);
			}

			// 添加css
			if (util.isObject(c.css)) {
				util.each(c.css, function(value, property) {
					el.style[property] = value;
				});
			}

			// 添加attr
			if (util.isObject(c.attr)) {
				util.each(c.attr, function(value, name) {
					dom.setAttr(el, name, value);
				});
			}

			// 添加页面布局
			if (c.html) {
				el.appendChild(util.stringToFragment(c.html));
			}

			// 初始化mvvm对象
			var model = c.model;
			if (util.isObject(model)) {
				this.vm = new MVVM(el, model, this);
			}

			// 追加到目标容器
			var target = c.target;
			if (target) {
				target.appendChild(el);
			}

			// 调用模块的(视图渲染完毕)后续回调方法
			var cb = this[c.cbRender];
			if (util.isFunc(cb)) {
				cb.call(this);
			}
		},

		/**
		 * 创建模板中所有标记的子模块，子模块创建的目标容器即为标记的DOM节点
		 * @param   {Object}   config  [多个子模块的配置集合]
		 */
		createTemplateModules: function(config) {
			var c = this.getConfig();

			// 收集子模块定义节点
			var node, name;
			var nodeList = this.queryAll('[module]');
			var i = 0, leng = nodeList.length, cfg, Class;

			for (; i < leng; i++) {
				node = nodeList[i];
				name = dom.getAttr(node, 'module');

				// 去掉模块节点记录
				if (c.tidyNode) {
					dom.removeAttr(node, 'module');
				}

				cfg = config[name];

				if (!cfg) {
					util.warn('module: ' + name + 'is not define in config!');
					continue;
				}

				Class = cfg.module;

				if (util.isFunc(Class)) {
					this.create(name, Class, util.extend(cfg.config, {'target': node}));
				}

			}
		},

		/**
		 * 返回当前DOM中第一个匹配特定选择器的元素
		 * @param  {String}     selector  [子元素选择器]
		 * @return {DOMObject}
		 */
		query: function(selector) {
			return this.el.querySelector(selector);
		},

		/**
		 * 返回当前DOM中匹配一个特定选择器的所有的元素
		 * @param  {String}    selectors  [子元素选择器]
		 * @return {NodeList}
		 */
		queryAll: function(selectors) {
			return this.el.querySelectorAll(selectors);
		},

		/**
		 * 元素添加绑定事件
		 */
		bind: function() {
			return dom.addEvent.apply(dom, arguments);
		},

		/**
		 * 元素解除绑定事件
		 */
		unbind: function() {
			return dom.removeEvent.apply(dom, arguments);
		},

		/**
		 * 模块销毁后的回调函数
		 */
		afterDestroy: function() {
			var vm = this.vm;
			var el = this.el;
			// 销毁MVVM对象
			if (vm) {
				vm.destroy();
				vm = null;
			}
			// 销毁DOM对象
			if (el) {
				el.parentNode.removeChild(el);
				el = null;
			}
		}
	});

	return Container;
});