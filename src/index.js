define([
	'./util',
	'./vm-index',
	'./messager',
	'./ajax',
	'./cache',
	'./dom',
	'./sync'
], function(util, VM, messager, ajax, cache, dom, Sync) {

	/*
	 * Root 根函数，实现类式继承
	 * @param  {Object}     proto   [生成类的新原型属性或方法]
	 * @return {Function}   Class   [继承后的类]
	 */
	function Root() {}
	Root.extend = function(proto) {
		var parent = this.prototype;

		/**
		 * 子类对父类的调用
		 * @param {String} method [调用的父类方法]
		 * @param {Array}  args   [调用参数]
		 */
		function Super(method, args) {
			var func = parent[method];
			if (util.isFunc(func)) {
				func.apply(this, args);
			}
		}

		/**
		 * 返回(继承后)的类
		 */
		function Class() {}
		var classProto = Class.prototype = Object.create(parent);

		util.each(proto, function(value, property) {
			classProto[property] = bindSuper(Super, value);
		});

		proto = null;
		Class.extend = this.extend;
		classProto.constructor = Class;

		return Class;
	}

	/**
	 * 对子类方法挂载Super
	 * @param   {Function}   Super    [Super函数]
	 * @param   {Mix}        method   [子类属性或者方法]
	 * @return  {Mix}
	 */
	function bindSuper(Super, method) {
		if (util.isFunc(method) && /\b\.Super\b/.test(Function.prototype.toString.call(method))) {
			return function() {
				this.Super = Super;
				method.apply(this, arguments);
			}
		}
		else {
			return method;
		}
	}


	/**
	 * 解析模块路径，返回真实路径和导出点
	 * @param   {String}   uri   [子模块uri]
	 * @return  {Object}
	 */
	function resolveUri(uri) {
		if (!util.isString(uri)) {
			return {};
		}

		// 根据"."拆解uri，处理/path/to/file.base的情况
		var point = uri.lastIndexOf('.');
		// 模块路径
		var path = '';
		// 模块导出点
		var expt = null;

		if (point !== -1) {
			path = uri.substr(0, point);
			expt = uri.substr(point + 1);
		}
		else {
			path = uri;
			expt = null;
		}

		return {
			'path': path,
			'expt': expt
		}
	}

	/**
	 * Module 系统模块基础类，实现所有模块的通用方法
	 */
	var childArray = 'childArray', childMap = 'childMap';
	var Module = Root.extend({
		/**
		 * _collections 记录模块信息
		 * @type {Object}
		 */
		_collections: {},

		/**
		 * 同步创建一个子模块实例
		 * @param  {String}   name     [子模块名称，同一模块下创建的子模块名称不能重复]
		 * @param  {Class}    Class    [生成子模块实例的类]
		 * @param  {Object}   config   [<可选>子模块配置参数]
		 * @return {Object}            [返回创建的子模块实例]
		 */
		create: function(name, Class, config) {
			if (!util.isString(name)) {
				util.error('module\'s name must be a type of String: ', name);
				return;
			}
			if (!util.isFunc(Class)) {
				util.error('module\'s Class must be a type of Function: ', Class);
				return;
			}
			if (config && !util.isObject(config)) {
				util.error('module\'s config must be a type of Object: ', config);
				return;
			}

			var cls = this._collections;

			// 建立模块关系信息
			if (!util.has(childArray, cls)) {
				// 子模块实例缓存数组
				cls[childArray] = [];
				// 子模块命名索引
				cls[childMap] = {};
			}

			// 判断是否已经创建过
			if (cls[childMap][name]) {
				util.error('Module\'s name already exists: ', name);
				return;
			}

			// 生成子模块实例
			var instance = new Class(config);

			// 记录子模块实例信息和父模块实例的对应关系
			var info = {
				// 子模块实例名称
				'name': name,
				// 子模块实例id
				'id'  : cache.id++,
				// 父模块实例id，0为顶级模块实例
				'pid' : cls.id || 0
			}
			instance._collections = info;

			// 存入系统实例缓存队列
			cache[info.id] = instance;
			cache.length++;

			// 缓存子模块实例
			cls[childArray].push(instance);
			cls[childMap][name] = instance;

			// 调用模块实例的init方法，传入配置参数和父模块
			if (util.isFunc(instance.init)) {
				instance.init(config, this);
			}

			return instance;
		},

		/**
		 * 异步请求模块文件
		 * @param   {String}     uri        [模块路径，支持路径数组]
		 * @param   {Function}   callback   [模块请求成功后的回调函数]
		 */
		requireAsync: function(uri, callback) {
			var context = this;

			// callback为属性值
			if (util.isString(callback)) {
				callback = context[callback];
			}

			if (!util.isFunc(callback)) {
				util.error('callback must be a type of Function: ', callback);
				return;
			}

			// CMD Seajs
			if (util.isFunc(require.async)) {
				require.async(uri, function() {
					callback.apply(context, arguments);
				});
			}
			// AMD requirejs
			else {
				require(util.isString(uri) ? [uri] : uri, function() {
					callback.apply(context, arguments);
				});
			}
		},

		/**
		 * 异步创建一个子模块实例
		 * @param  {String}     name       [子模块名称，同一模块下创建的子模块名称不能重复]
		 * @param  {String}     uri        [子模块uri（路径），支持.获取文件模块指定实例]
		 * @param  {Object}     config     [<可选>子模块配置参数]
		 * @param  {Function}   callback   [<可选>子模块实例创建完成后的回调函数]
		 */
		createAsync: function(name, uri, config, callback) {
			if (!util.isString(name)) {
				util.error('module\'s name must be a type of String: ', name);
				return;
			}
			if (!util.isString(uri)) {
				util.error('module\'s uri must be a type of String: ', uri);
				return;
			}

			// 不传配置
			if (util.isFunc(config) || util.isString(config)) {
				callback = config;
				config = null;
			}

			// 解析子模块路径
			var resolve = resolveUri(uri);
			// 子模块真实路径
			var path = resolve.path;
			// 模块导出点
			var expt = resolve.expt;

			// 异步加载模块
			Sync.lock();
			this.requireAsync(path, function(Class) {
				var args = Array(1);

				// 取导出点
				if (Class && expt) {
					Class = Class[expt];
				}

				// 创建子模块
				if (Class) {
					Sync.addQueue(callback, this, args);
					args[0] = this.create(name, Class, config);
				}

				Sync.unlock();
			});
		},

		/**
		 * 异步创建多个子模块实例
		 * @param   {Object}     modsMap    [子模块名称与路径和配置的映射关系]
		 * @param   {Function}   callback   [全部子模块实例创建完后的回调函数]
		 */
		createArrayAsync: function(modsMap, callback) {
			// 子模块数组
			var modArray = [];
			// 子模块路径集合
			var pathArray = [];

			util.each(modsMap, function(item, index) {
				if (item.path && item.name && item.target) {
					modArray.push({
						'name'  : item.name,
						'expt'  : item.expt,
						'target': item.target,
						'config': item.config
					});
					pathArray.push(item.path);
				}
			});

			Sync.lock();
			this.requireAsync(pathArray, function() {
				var args = util.argumentsToArray(arguments);
				var retMods = [], mod, name, expt, config, child;

				Sync.addQueue(callback, this, [retMods]);

				util.each(args, function(Class, index) {
					mod = modArray[index];
					name = mod.name;
					expt = mod.expt;
					config = util.extend(mod.config, {
						'target': mod.target
					});

					// 取导出点
					if (Class && expt) {
						Class = Class[expt];
					}

					// 创建子模块
					if (Class) {
						child = this.create(name, Class, config);
						retMods.push(child);
					}
				}, this);

				Sync.unlock();
			});
		},

		/**
		 * 获取当前模块的父模块实例（模块创建者）
		 */
		getParent: function() {
			var cls = this._collections;
			var pid = cls && cls.pid;
			return cache[pid] || null;
		},

		/**
		 * 获取当前模块创建的指定名称的子模块实例
		 * @param  {String}   name   [子模块名称]
		 * @return {Object}
		 */
		getChild: function(name) {
			var cls = this._collections;
			return cls && cls[childMap] && cls[childMap][name] || null;
		},

		/**
		 * 返回当前模块的所有子模块实例
		 * @param  {Boolean}   returnArray   [返回的集合是否为数组形式，否则返回映射结构]
		 * @return {Mix}
		 */
		getChilds: function(returnArray) {
			var cls = this._collections;
			returnArray = util.isBoolean(returnArray) && returnArray;
			return returnArray ? (cls[childArray] || []) : (cls[childMap] || {});
		},

		/**
		 * 移除当前模块实例下的指定子模块的记录
		 * @param  {String}   name   [子模块名称]
		 * @return {Boolean}
		 */
		_removeChild: function(name) {
			var cls = this._collections;
			var cMap = cls[childMap] || {};
			var cArray = cls[childArray] || [];
			var child = cMap[name];

			if (!child) {
				return;
			}

			for (var i = 0, len = cArray.length; i < len; i++) {
				if (cArray[i].id === child.id) {
					delete cMap[name];
					cArray.splice(i, 1);
					break;
				}
			}
		},

		/**
		 * 模块销毁函数，只删除缓存队列中的记录和所有子模块集合
		 * @param  {Mix}   notify   [是否向父模块发送销毁消息]
		 */
		destroy: function(notify) {
			var cls = this._collections;
			var name = cls.name;

			// 调用销毁前函数，可进行必要的数据保存
			if (util.isFunc(this.beforeDestroy)) {
				this.beforeDestroy();
			}

			// 递归调用子模块的销毁函数
			var childs = this.getChilds(true);
			util.each(childs, function(child) {
				if (util.isFunc(child.destroy)) {
					child.destroy(-1);
				}
			});

			// 从父模块删除（递归调用时不需要）
			var parent = this.getParent();
			if (notify !== -1 && parent) {
				parent._removeChild(name);
			}

			// 从系统缓存队列中销毁相关记录
			var id = cls.id;
			if (util.has(id, cache)) {
				delete cache[id];
				cache.length--;
			}

			// 调用销毁后函数，可进行销毁界面和事件
			if (util.isFunc(this.afterDestroy)) {
				this.afterDestroy();
			}

			// 向父模块通知销毁消息
			if (notify === true) {
				this.fire('subDestroyed', name);
			}
		},

		/**
		 * 当前模块作用域的定时器
		 * @param {Function}   callback   [定时器回调函数]
		 * @param {Number}     time       [<可选>回调等待时间（毫秒）不填为0]
		 * @param {Array}      param      [<可选>回调函数的参数]
		 */
		setTimeout: function(callback, time, param) {
			var self = this;
			time = util.isNumber(time) ? time : 0;

			// callback为属性值
			if (util.isString(callback)) {
				callback = this[callback];
			}

			// 不合法的回调函数
			if (!util.isFunc(callback)) {
				util.error('callback must be a type of Function: ', callback);
				return;
			}

			// 参数必须为数组或arguments对象
			if (param && !util.isFunc(param.callee) && !util.isArray(param)) {
				param = [param];
			}

			return setTimeout(function() {
				callback.apply(self, param);
				self = callback = time = param = null;
			}, time);
		},

		/**
		 * 冒泡（由下往上）方式发送消息，由子模块发出，逐层父模块接收
		 * @param  {String}     name       [发送的消息名称]
		 * @param  {Mix}        param      [<可选>附加消息参数]
		 * @param  {Function}   callback   [<可选>发送完毕的回调函数，可在回调中指定回应数据]
		 */
		fire: function(name, param, callback) {
			if (!util.isString(name)) {
				util.error('message\'s name must be a type of String: ', name);
				return;
			}

			// 不传param
			if (util.isFunc(param)) {
				callback = param;
				param = null;
			}

			// callback为属性值
			if (util.isString(callback)) {
				// callback = 'on' + util.ucFirst(callback);
				callback = this[callback];
			}

			// 不传callback
			if (!callback) {
				callback = null;
			}

			messager.fire(this, name, param, callback, this);
		},

		/**
		 * 广播（由上往下）方式发送消息，由父模块发出，逐层子模块接收
		 */
		broadcast: function(name, param, callback) {
			if (!util.isString(name)) {
				util.error('message\'s name must be a type of String: ', name);
				return false;
			}

			// 不传param
			if (util.isFunc(param)) {
				callback = param;
				param = null;
			}

			// callback为属性值
			if (util.isString(callback)) {
				// callback = 'on' + util.ucFirst(callback);
				callback = this[callback];
			}

			// 不传callback
			if (!callback) {
				callback = null;
			}

			messager.broadcast(this, name, param, callback, this);
		},

		/**
		 * 向指定模块实例发送消息
		 * @param   {String}     receiver   [消息接受模块实例的名称以.分隔，要求完整的层级]
		 * @param   {String}     name       [发送的消息名称]
		 * @param   {Mix}        param      [<可选>附加消息参数]
		 * @param   {Function}   callback   [<可选>发送完毕的回调函数，可在回调中指定回应数据]]
		 */
		notify: function(receiver, name, param, callback) {
			if (!util.isString(receiver)) {
				util.error('receiver\'s name must be a type of String: ', name);
				return false;
			}

			if (!util.isString(name)) {
				util.error('message\'s name must be a type of String: ', name);
				return false;
			}

			// 不传param
			if (util.isFunc(param)) {
				callback = param;
				param = null;
			}

			// callback为属性值
			if (util.isString(callback)) {
				// callback = 'on' + util.ucFirst(callback);
				callback = this[callback];
			}

			// 不传callback
			if (!callback) {
				callback = null;
			}

			messager.notify(this, receiver, name, param, callback, this);
		}
	});


	/**
	 * Core 核心模块，用于顶层模块的创建
	 */
	var Core = Module.extend({
		/**
		 * 获取顶级模块实例
		 * @param  {String}   name   [模块实例名称]
		 * @return {Object}
		 */
		get: function(name) {
			return this.getChild(name);
		},

		/**
		 * 全局广播消息，由core模块发出，系统全部实例接收
		 * @param  {String}   name    [发送的消息名称]
		 * @param  {Mix}      param   [<可选>附加消息参数]
		 * @return {Boolean}
		 */
		globalCast: function(name, param) {
			if (!util.isString(name)) {
				util.error('message\'s name must be a type of String: ', name);
				return;
			}

			messager.globalCast(name, param);
		}
	});


	/**
	 * 模块配置参数合并、覆盖
	 * @param  {Object} child  [子类模块配置参数]
	 * @param  {Object} parent [父类模块配置参数]
	 * @return {Object}        [合并后的配置参数]
	 */
	function cover(child, parent) {
		if (!util.isObject(child)) {
			child = {};
		}
		if (!util.isObject(parent)) {
			parent = {};
		}
		return util.extend(parent, child);
	}

	/**
	 * Container 视图类基础模块
	 */
	var Container = Module.extend({
		/**
		 * init 模块初始化方法
		 * @param  {Object}   config   [模块参数配置]
		 * @param  {Object}   parent   [父模块对象]
		 */
		init: function(config, parent) {
			this._config = cover(config, {
				// 模块目标容器
				'target'  : null,
				// DOM元素的标签
				'tag'     : 'div',
				// DOM元素的class
				'class'   : '',
				// DOM元素的CSS
				'css'     : null,
				// DOM元素的attr
				'attr'    : null,
				// 视图布局内容(html结构字符串)
				'html'    : '',
				// 静态模板uri
				'template': '',
				// 模板拉取请求参数(用于输出不同模板的情况)
				'tplParam': null,
				// vvm数据对象模型
				'model'   : null,
				// 视图渲染完成后的回调函数
				'cbRender': 'viewReady',
				// 从模板创建子模块后，是否移除节点的模块标记
				'tidyNode': false
			});

			// 模块元素
			this.el = null;
			// vm对象
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

			Sync.lock();
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

				Sync.unlock();
			}, this);
		},

		/**
		 * 获取模块配置参数
		 * @param  {String}   name   [参数字段名称，支持/层级]
		 */
		getConfig: function(name) {
			return util.config(this._config, name);
		},

		/**
		 * 设置模块配置参数
		 * @param {String}   name    [配置字段名]
		 * @param {Mix}      value   [值]
		 */
		setConfig: function(name, value) {
			return util.config(this._config, name, value);
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

			var element = this.el = util.DOC.createElement(c.tag);

			// 添加页面布局
			if (c.html) {
				element.appendChild(util.stringToFragment(c.html));
			}

			// 初始化vm对象
			var model = c.model;
			if (util.isObject(model)) {
				this.vm = new VM(element, model, this);
			}

			// 追加到目标容器
			var target = c.target;
			if (target) {
				target.appendChild(element);
			}

			// 调用模块的(视图渲染完毕)后续回调方法
			var cb = this[c.cbRender];
			if (util.isFunc(cb)) {
				cb.call(this);
			}
		},

		/**
		 * 创建模板中所有标记的子模块，子模块创建的目标容器即为标记的DOM节点
		 * @param   {Object}     configMap   [模块配置映射]
		 * @param   {Function}   callback    [全部子模块创建完成后的回调]
		 */
		createTplModules: function(configMap, callback) {
			var modsMap = {};
			var dom = this.getDOM();
			var c = this.getConfig();
			var mName = 'm-name', mModule = 'm-module';
			var config = util.isObject(configMap) ? configMap : {};

			// 收集子模块定义节点
			var node, uri, name, resolve;
			var modNodes = dom.find('['+ mName +']');
			modNodes.each(function() {
				node = jquery(this);
				uri = node.attr(mModule);
				name = node.attr(mName);

				// 是否去掉模块节点记录
				if (c.tidyNode) {
					node.removeAttr(mName);
					node.removeAttr(mModule);
				}

				// 解析子模块路径
				resolve = resolveUri(uri);

				// 记录子模块
				modsMap[name] = {
					// 子模块名称
					'name'  : name,
					// 子模块真实路径
					'path'  : resolve.path,
					// 子模块导出点
					'expt'  : resolve.expt,
					// 子模块配置参数
					'config': config[name],
					// 子模块目标容器
					'target': node
				};
			});

			// 没有特殊指定callback默认调用afterBuild
			if (!callback) {
				callback = this.afterBuild;
			}

			// 异步创建子模块集合
			this.createArrayAsync(modsMap, callback);
		},

		/**
		 * 返回当前DOM中第一个匹配特定选择器的元素
		 * @param  {String}      selector   [子元素选择器]
		 * @return {DOMObject}
		 */
		query: function(selector) {
			return this.el.querySelector(selector);
		},

		/**
		 * 返回当前DOM中匹配一个特定选择器的所有的元素
		 * @param  {String}      selectors   [子元素选择器]
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
		 * 模块销毁后的回调函数，销毁视图界面和取消所有的事件绑定
		 */
		afterDestroy: function() {
			var vm = this.vm;
			var el = this.el;
			if (el) {
				// 销毁VM对象
				if (vm) {
					vm._vm.$destroy();
					vm = null;
				}

				// 销毁DOM对象
				el.parentNode.removeChild(el);
				el = null;
			}
		}
	});


	function Sugar() {
		/**
		 * 数据处理实例
		 * @type  {Object}
		 */
		this.ajax = ajax;

		/**
		 * 异步模块回调状态锁
		 * @type  {Function}
		 */
		this.sync = Sync;

		/**
		 * 基础模块类
		 * @type  {Class}
		 */
		this.Module = Module;

		/**
		 * 系统核心模块实例
		 * @type  {Object}
		 */
		this.core = cache['0'] = new Core();

		/**
		 * 子父模块配置参数覆盖方法
		 * @type  {Function}
		 */
		this.cover = cover;

		/**
		 * 视图基础模块类
		 * @type  {Class}
		 */
		this.Container = Container;
	}

	return new Sugar();
});