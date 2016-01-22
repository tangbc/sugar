define([
	'../src/util',
	'../src/mvvm-index',
	'../jquery.min',
	'../src/messager',
	'../src/ajax',
	'../src/event'
], function(util, VM, jquery, messager, ajax, events) {
	var UDF, WIN = this;

	/**
	 * 系统配置对象，可通过导出实例的init接口进行设置
	 * @type  {Object}
	 */
	var CONFIG = {
		// 配置文件数据
		'data'       : {},
		// ajax最大同时请求数
		'maxQuery'   : 5,
		// ajax响应超时的毫秒数
		'timeout'    : 10000,
		// ajax返回数据格式
		'dataType'   : 'json',
		// ajax数据内容格式
		'contentType': 'application/json; charset=UTF-8',
		// 视图模板文件中的子模块标记属性名称
		'mName'      : 'm-name',
		// 视图模块文件中的子模块标记属性路径
		'mModule'    : 'm-module'
	};


	/*
	 * 创建一个拥有指定原型的对象
	 * @param  {Object} proto   [指定的原型对象]
	 * @return {Object} pointer [拥有proto原型的对象]
	 */
	function createProto(proto) {
		var pointer = null;
		var Obc = Object.create;
		var standard = util.isFunc(Obc);
		var Foo = !standard ? function() {} : null;

		if (standard) {
			pointer = Obc(proto);
		}
		else {
			Foo.prototype = proto;
			pointer = new Foo();
		}

		return pointer;
	}

	/**
	 * 对子类方法挂载Super
	 * @param   {Function}  Super   [Super函数]
	 * @param   {Mix}       method  [子类属性或者方法]
	 * @return  {Mix}               [result]
	 */
	function bindSuper(Super, method) {
		if (util.isFunc(method) && /\b\.Super\b/.test(Function.prototype.toString.call(method))) {
			return function() {
				this.Super = Super;
				method.apply(this, arguments);
			};
		}
		else {
			return method;
		}
	}

	/*
	 * Root 根函数，实现类式继承
	 * @param  {Object}   proto [生成类的新原型属性或方法]
	 * @return {Function} Class [继承后的类]
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
		var classProto = Class.prototype = createProto(parent);

		util.each(proto, function(value, property) {
			classProto[property] = bindSuper(Super, value);
		});

		proto = null;
		Class.extend = this.extend;
		classProto.constructor = Class;
		return Class;
	};


	/**
	 * 设置/读取配置对象
	 * @param  {Object} cData  [配置对象，不传在则读取CONFIG系统配置的data]
	 * @param  {String} name   [配置名称, 支持/分隔层次]
	 * @param  {Mix}    value  [不传为读取配置信息, null为删除配置, 其他为设置值]
	 * @return {Mix}           [返回读取的配置值, 操作失败返回false]
	 */
	function appConfig(cData, name, value) {
		// 不传cData配置对象
		if (util.isString(cData) || arguments.length === 0) {
			value = name;
			name = cData;
			cData = CONFIG.data;
		}

		var set = (value !== UDF);
		var remove = (value === null);
		var data = cData;

		if (name) {
			var ns = name.split('/');
			while (ns.length > 1 && util.has(ns[0], data)) {
				data = data[ns.shift()];
			}
			if (ns.length > 1) {
				if (set) {
					return false;
				}
				if (remove)	{
					return true;
				}
				return UDF;
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
	}


	/**
	 * 异步状态锁，处理模块创建的异步回调和通信，实现回调函数按队列触发
	 * @param  {Mix}     callback  [回调函数]
	 * @param  {Object}  context   [回调函数执行环境]
	 * @param  {Array}   args      [callback回调参数]
	 *
	 *   Sync(1)                      : 回调计数开始
	 *   Sync(0)                      : 回调计数结束
	 *   Sync(callback, context, args): 放入回调队列
	 *
	 */
	var syncCount = 0, syncQueue = [];
	function Sync(callback, context, args) {
		var sync, cb, ct, ags;
		// 回调计数开始
		if (callback === 1) {
			syncCount++;
		}
		// 回调计数结束
		else if (callback === 0) {
			syncCount--;

			// 依次从最后的回调开始处理
			while (syncCount === 0 && syncQueue.length) {
				sync = syncQueue.pop();
				// 回调函数
				cb = sync[0];
				// 执行环境
				ct = sync[1];
				// 回调参数
				ags = sync[2];

				// callback为属性值
				if (util.isString(cb)) {
					cb = ct[cb];
				}

				if (util.isFunc(cb)) {
					cb.apply(ct, ags);
				}
			}
		}
		// 回调函数，放入回调队列
		else if (util.isFunc(callback)) {
			syncQueue.push([callback, context, args]);
		}
	}


	/**
	 * sysCaches 系统模块实例缓存队列
	 * 模块的唯一id对应模块的实例
	 */
	var sysCaches = {'id': 1, 'length': 0};

	/**
	 * 解析模块路径，返回真实路径和导出点
	 * @param   {String}  uri  [子模块uri]
	 * @return  {Object}       [导出对象]
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
		};
	}

	/**
	 * Module 系统模块基础类，实现所有模块的通用方法
	 * childArray Array  对应该模块下所有子模块数组字段
	 * childMap   Object 对应该模块下所有子模块映射字段
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
		 * @param  {String} name   [子模块名称，同一模块下创建的子模块名称不能重复]
		 * @param  {Class}  Class  [生成子模块实例的类]
		 * @param  {Object} config [<可选>子模块配置参数]
		 * @return {Object}        [返回创建的子模块实例，失败返回false]
		 */
		create: function(name, Class, config) {
			if (!util.isString(name)) {
				util.error('module\'s name must be a type of String: ', name);
				return false;
			}
			if (!util.isFunc(Class)) {
				util.error('module\'s Class must be a type of Function: ', Class);
				return false;
			}
			if (config && !util.isObject(config)) {
				util.error('module\'s config must be a type of Object: ', config);
				return false;
			}

			var cls = this._collections;
			// 建立关系信息
			if (!util.has(childArray, cls)) {
				// 子模块实例缓存数组
				cls[childArray] = [];
				// 子模块命名索引
				cls[childMap] = {};
			}

			// 判断是否已经创建过
			if (cls[childMap][name]) {
				util.error('Module\'s name already exists: ', name);
				return false;
			}

			// 生成子模块实例
			var instance = new Class(config);

			// 记录子模块实例信息和父模块实例的对应关系
			var info = {
				// 子模块实例名称
				'name': name,
				// 子模块实例id
				'id'  : sysCaches.id++,
				// 父模块实例id，0为顶级模块实例
				'pid' : cls.id || 0
			};
			instance._collections = info;

			// 存入系统实例缓存队列
			sysCaches[info.id] = instance;
			sysCaches.length++;

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
		 * @param   {String}    uri       [模块路径，支持路径数组]
		 * @param   {Function}  callback  [模块请求成功后的回调函数]
		 */
		requireAsync: function(uri, callback) {
			var context = this;

			// callback为属性值
			if (util.isString(callback)) {
				callback = context[callback];
			}

			// 不合法的回调函数
			if (!util.isFunc(callback)) {
				util.error('callback must be a type of Function: ', callback);
				return false;
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
		 * @param  {String}   name     [子模块名称，同一模块下创建的子模块名称不能重复]
		 * @param  {String}   uri      [子模块uri（路径），支持.获取文件模块指定实例]
		 * @param  {Object}   config   [<可选>子模块配置参数]
		 * @param  {Function} callback [<可选>子模块实例创建完成后的回调函数]
		 */
		createAsync: function(name, uri, config, callback) {
			if (!util.isString(name)) {
				util.error('module\'s name must be a type of String: ', name);
				return false;
			}
			if (!util.isString(uri)) {
				util.error('module\'s uri must be a type of String: ', uri);
				return false;
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
			var args = null;
			Sync(1);
			this.requireAsync(path, function(Class) {
				// 取导出点
				if (Class && expt) {
					Class = Class[expt];
				}

				// 创建子模块
				if (Class) {
					args = Array(1);
					Sync(callback, this, args);
					args[0] = this.create(name, Class, config);
				}
				Sync(0);
			});

			return this;
		},

		/**
		 * 异步创建多个子模块实例
		 * @param   {Object}    modsMap   [子模块名称与路径和配置的映射关系]
		 * @param   {Function}  callback  [全部子模块实例创建完后的回调函数]
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

			Sync(1);
			this.requireAsync(pathArray, function() {
				var args = util.argumentsToArray(arguments);
				var retMods = [], mod, name, expt, config, child;

				Sync(callback, this, [retMods]);
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
				Sync(0);
			});
		},

		/**
		 * 获取当前模块的父模块实例（模块创建者）
		 */
		getParent: function() {
			var cls = this._collections;
			var pid = cls && cls.pid;
			return sysCaches[pid] || null;
		},

		/**
		 * 获取当前模块创建的指定名称的子模块实例
		 * @param  {String} name [子模块名称]
		 * @return {Object}      [目标实例，不存在返回null]
		 */
		getChild: function(name) {
			var cls = this._collections;
			return cls && cls[childMap] && cls[childMap][name] || null;
		},

		/**
		 * 返回当前模块的所有子模块实例
		 * @param  {Boolean} returnArray [返回的集合是否为数组形式，否则返回映射结构]
		 * @return {Mix}                 [对象或者数组]
		 */
		getChilds: function(returnArray) {
			var cls = this._collections;
			returnArray = util.isBoolean(returnArray) && returnArray;
			return returnArray ? (cls[childArray] || []) : (cls[childMap] || {});
		},

		/**
		 * 移除当前模块实例下的指定子模块的记录
		 * @param  {String}  name [子模块名称]
		 * @return {Boolean}      [result]
		 */
		_removeChild: function(name) {
			var cls = this._collections;
			var cMap = cls[childMap] || {};
			var cArray = cls[childArray] || [];
			var child = cMap[name];
			if (!child) {
				return false;
			}
			for (var i = 0, len = cArray.length; i < len; i++) {
				if (cArray[i].id === child.id) {
					delete cMap[name];
					cArray.splice(i, 1);
					break;
				}
			}
			return true;
		},

		/**
		 * 模块销毁函数，只删除缓存队列中的记录和所有子模块集合
		 * @param  {Mix}  notify [是否向父模块发送销毁消息]
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
			if (util.has(id, sysCaches)) {
				delete sysCaches[id];
				sysCaches.length--;
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
		 * 修正作用域的定时器
		 * @param {Function} callback [定时器回调函数]
		 * @param {Number}   time     [<可选>回调等待时间（毫秒）不填为0]
		 * @param {Array}    param    [<可选>回调函数的参数]
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
				return null;
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
		 * @param  {String}   name     [发送的消息名称]
		 * @param  {Mix}      param    [<可选>附加消息参数]
		 * @param  {Function} callback [<可选>发送完毕的回调函数，可在回调中指定回应数据]
		 */
		fire: function(name, param, callback) {
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
		 * @param   {String}    receiver  [消息接受模块实例的名称以.分隔，要求完整的层级]
		 * @param   {String}    name      [发送的消息名称]
		 * @param   {Mix}       param     [<可选>附加消息参数]
		 * @param   {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]]
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
		 * @param  {String} name [模块实例名称]
		 * @return {Object}      [模块实例]
		 */
		get: function(name) {
			return this.getChild(name);
		},

		/**
		 * 全局广播消息，由core模块发出，系统全部实例接收
		 * @param  {String}   name     [发送的消息名称]
		 * @param  {Mix}      param    [<可选>附加消息参数]
		 * @return {Boolean}           [result]
		 */
		globalCast: function(name, param) {
			if (!util.isString(name)) {
				util.error('message\'s name must be a type of String: ', name);
				return false;
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
	 * 模板多语言替换标记
	 * @type  {RegExp}
	 */
	var langReg = /\{\% (.+?) \%\}/g;
	function langReplace(all, text) {
		return util.TRANSLATE(text);
	}

	/**
	 * Container 视图类基础模块
	 */
	var Container = Module.extend({
		/**
		 * init 模块初始化方法
		 * @param  {Object} config [模块参数配置]
		 * @param  {Object} parent [父模块对象]
		 */
		init: function(config, parent) {
			this._config = cover(config, {
				// 模块目标容器
				'target'  : null,
				// DOM元素的标签
				'tag'     : 'div',
				// DOM元素的class
				'class'   : '',
				// DOM元素的CSS(以jQuery的css方法设置)
				'css'     : null,
				// DOM元素的attr(以jQuery的attr方法设置)
				'attr'    : null,
				// 视图布局内容(html结构字符串)
				'html'    : '',
				// 静态模板uri
				'template': '',
				// 模板拉取请求参数(用于输出不同模板的情况)
				'tplParam': null,
				// mvvvm数据对象模型
				'model'   : null,
				// 视图渲染完成后的回调函数
				'cbRender': 'viewReady',
				// 从模板创建子模块后，是否移除节点的模块标记
				'tidyNode': false
			});
			// DOM对象
			this._domObject = null;
			// mvvm对象
			this.vm = null;
			// 模块是否已经创建完成
			this._ready = false;

			// 调用渲染前函数
			if (util.isFunc(this.beforeRender)) {
				this.beforeRender();
			}

			// 是否从模板拉取布局
			if (this.getConfig('template')) {
				this._loadTemplate();
			}
			else {
				this._render();
			}
		},

		/**
		 * 加载模板文件
		 */
		_loadTemplate: function() {
			var c = this.getConfig();
			var uri = c.template;
			var param = util.extend(c.tplParam, {
				'ts': util.random()
			});

			Sync(1);
			ajax.load(uri, param, function(err, text) {
				if (err) {
					text = err.code + ' ' + err.message + ': ' + uri;
					util.error(err);
				}
				// 替换多语言标记
				text = text.replace(langReg, langReplace);
				this.setConfig('html', text);
				this._render();
				Sync(0);
			}, this);
		},

		/**
		 * 获取配置参数
		 * @param  {String} name [参数字段名称，支持/层级]
		 */
		getConfig: function(name) {
			return appConfig(this._config, name);
		},

		/**
		 * 设置配置参数
		 * @param {String} name  [配置字段名]
		 * @param {Mix}    value [值]
		 */
		setConfig: function(name, value) {
			return appConfig(this._config, name, value);
		},

		/**
		 * 渲染视图容器的布局、属性和初始化vm
		 */
		_render: function() {
			// 判断是否已创建过
			if (this._ready) {
				return this;
			}
			this._ready = true;

			var c = this.getConfig();

			var element = this._domObject = jquery('<'+ c.tag +'/>');

			if (c.class) {
				element.addClass(c.class);
			}

			if (c.css) {
				element.css(c.css);
			}

			if (c.attr) {
				element.attr(c.attr);
			}

			// 添加页面布局元素
			if (c.html && util.isString(c.html)) {
				element.html(c.html);
			}

			// 插入目标容器，初始化vm
			var target = c.target, model = c.model;
			if (target) {
				// 初始化vm对象
				if (util.isObject(model)) {
					this.vm = new VM(element.get(0), model, this);
				}
				element.appendTo(target);
			}

			// 调用模块的(视图渲染完毕)后续回调方法
			var cb = this[c.cbRender];
			if (util.isFunc(cb)) {
				cb.call(this);
			}
		},

		/**
		 * 创建模板中所有标记的子模块，子模块创建的目标容器即为标记的DOM节点
		 * @param   {Object}    configMap  [模块配置映射]
		 * @param   {Function}  callback   [全部子模块创建完成后的回调]
		 */
		createTplModules: function(configMap, callback) {
			var modsMap = {};
			var dom = this.getDOM();
			var c = this.getConfig();
			var mName = CONFIG.mName, mModule = CONFIG.mModule;
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
		 * 返回/查找视图模块的DOM元素
		 * @param  {String}    selector [子元素选择器，空则返回模块容器DOM]
		 * @return {DOMObject}          [jQuery DOM对象]
		 */
		getDOM: function(selector) {
			var domObject = this._domObject;
			return selector && util.isString(selector) ? domObject.find(selector) : domObject;
		},

		/**
		 * 为元素添加绑定事件
		 */
		bind: function() {
			return events.bind.apply(this, arguments);
		},

		/**
		 * 从元素上移除bind添加的事件处理函数
		 */
		unbind: function() {
			return events.unbind.apply(this, arguments);
		},

		/**
		 * 代理事件
		 */
		proxy: function() {
			return events.proxy.apply(this, arguments);
		},

		/**
		 * 移除proxy添加的事件处理函数
		 */
		unProxy: function() {
			return events.unProxy.apply(this, arguments);
		},

		/**
		 * 模块销毁后的回调函数，销毁视图界面和取消所有的事件绑定
		 */
		afterDestroy: function() {
			var vm = this.vm;
			var domObject = this._domObject;
			if (domObject) {
				// 销毁VM对象
				if (vm) {
					vm._vm.$destroy();
					vm = null;
				}

				// 取消所有事件
				this.unbind(domObject);
				domObject.find('*').unbind();

				// 销毁DOM对象
				domObject.remove();
				domObject = null;
			}
		}
	});


	/**
	 * Sugar构造函数
	 */
	function Sugar() {
		/**
		 * sugar系统配置参数初始化接口，可将全局配置文件引入，挂载其他基础模块
		 * @param  {Object} config  [系统全局配置]
		 * @param  {Object} modMap  [挂载模块映射对象]
		 */
		this.init = function(config, modMap) {
			// 系统全局配置对象
			if (util.isObject(config)) {
				CONFIG = util.extend(CONFIG, config);
			}

			// 挂载其他基础模块
			util.each(modMap, function(mod, name) {
				if (this[name]) {
					util.error(name + ' is already defined in sugar.js!');
					return false;
				}
				else {
					this[name] = mod;
				}
			}, this);

			return this;
		};

		/**
		 * 辅助功能函数库
		 * @type  {Object}
		 */
		this.util = util;

		/**
		 * jquery库
		 * @type  {Function}
		 */
		this.jquery = jquery;

		/**
		 * 系统配置方法
		 * @type  {Function}
		 */
		this.config = appConfig;

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
		 * 系统模块实例缓存队列
		 * @type  {Object}
		 */
		this.sysCaches = sysCaches;

		/**
		 * 基础模块类
		 * @type  {Class}
		 */
		this.Module = Module;

		/**
		 * 系统核心模块实例
		 * @type  {Object}
		 */
		this.core = sysCaches['0'] = new Core();

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