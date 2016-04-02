/*!
 * sugar.js v2.0.0
 * (c) 2016 TANG
 * https://github.com/tangbc/sugar
 * released under the MIT license.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Sugar"] = factory();
	else
		root["Sugar"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1),
		__webpack_require__(2),
		__webpack_require__(3),
		__webpack_require__(5),
		__webpack_require__(8)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util, ajax, core, Module, Container) {

		function Sugar() {
			/**
			 * 工具方法
			 * @type  {Object}
			 */
			this.util = util;

			/**
			 * Ajax
			 * @type  {Object}
			 */
			this.ajax = ajax;

			/**
			 * 系统核心模块实例
			 * @type  {Object}
			 */
			this.core = core;

			/**
			 * 基础模块类
			 * @type  {Class}
			 */
			this.Module = Module;

			/**
			 * 视图基础模块类
			 * @type  {Class}
			 */
			this.Container = Container;
		}

		return new Sugar();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * 通用函数库
	 */
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
		var WIN = window;
		var DOC = WIN.document;
		var OP = Object.prototype;
		var AP = Array.prototype;
		var hasOwn = OP.hasOwnProperty;

		/**
		 * 是否是对象自变量, {}或new Object()的形式
		 */
		function isObject(obj) {
			return OP.toString.call(obj) === '[object Object]';
		}

		/**
		 * 是否是真数组, []或new Array()的形式
		 */
		function isArray(obj) {
			return OP.toString.call(obj) === '[object Array]';
		}

		/**
		 * 是否是函数
		 */
		function isFunc(fn) {
			return fn instanceof Function;
		}

		/**
		 * 是否是字符串
		 */
		function isString(str) {
			return typeof(str) === 'string';
		}

		/**
		 * 是否是布尔值
		 */
		function isBoolean(bool) {
			return typeof(bool) === 'boolean';
		}

		/**
		 * 是否是数字
		 */
		function isNumber(num) {
			return typeof(num) === 'number' && !isNaN(num);
		}

		/**
		 * 是否是纯粹对象
		 */
		function isPlainObject(obj) {
			if (!obj || !isObject(obj) || obj.nodeType || obj === obj.window) {
				return false;
			}
			if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
				return false;
			}
			return true;
		}


		/**
		 * Util构造函数
		 */
		function Util() {
			this.OP = OP;
			this.AP = AP;
			this.WIN = WIN;
			this.DOC = DOC;

			this.isFunc = isFunc;
			this.isArray = isArray;
			this.isNumber = isNumber;
			this.isObject = isObject;
			this.isString = isString;
			this.isBoolean = isBoolean;
		}

		var up = Util.prototype;
		var util, cons = window.console;


		/**
		 * 打印日志
		 */
		up.log = function() {
			cons.log.apply(cons, arguments);
		}

		/**
		 * 打印错误
		 */
		up.error = function() {
			cons.error.apply(cons, arguments);
		}

		/**
		 * 打印警告信息
		 */
		up.warn = function() {
			cons.warn.apply(cons, arguments);
		}

		/*
		 * 对象自有属性检测
		 */
		up.hasOwn = function(obj, key) {
			return obj && hasOwn.call(obj, key);
		}

		/**
		 * object定义或修改属性
		 * @param   {Object|Array}  object        [数组或对象]
		 * @param   {String}        property      [属性或数组下标]
		 * @param   {Mix}           value         [属性的修改值/新值]
		 * @param   {Boolean}       writable      [该属性是否能被赋值运算符改变]
		 * @param   {Boolean}       enumerable    [该属性是否出现在枚举中]
		 * @param   {Boolean}       configurable  [该属性是否能够被改变或删除]
		 */
		up.defineProperty = function(object, property, value, writable, enumerable, configurable) {
			return Object.defineProperty(object, property, {
				'value'       : value,
				'writable'    : !!writable,
				'enumerable'  : !!enumerable,
				'configurable': !!configurable
			});
		}

		/**
		 * 遍历数组或对象
		 * @param  {Array|Object}  items     [数组或对象]
		 * @param  {Fuction}       callback  [回调函数]
		 * @param  {Object}        context   [作用域]
		 */
		up.each = function(items, callback, context) {
			var ret, i;

			if (!items) {
				return;
			}

			if (!context) {
				context = WIN;
			}

			if (isString(callback)) {
				callback = context[callback];
			}

			// 数组
			if (isArray(items)) {
				for (i = 0; i < items.length; i++) {
					ret = callback.call(context, items[i], i);

					// 回调返回false退出循环
					if (ret === false) {
						break;
					}

					// 回调返回null删除当前选项
					if (ret === null) {
						items.splice(i, 1);
						i--;
					}
				}
			}
			// 对象
			else if (isObject(items)) {
				for (i in items) {
					if (!this.hasOwn(items, i)) {
						continue;
					}

					ret = callback.call(context, items[i], i);

					// 回调返回false退出循环
					if (ret === false) {
						break;
					}

					// 回调返回null删除当前选项
					if (ret === null) {
						delete items[i];
					}
				}
			}
		}

		/**
		 * 扩展合并对象，摘自jQuery
		 */
		up.extendObject = function() {
			var options, name, src, copy, copyIsArray, clone;
			var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

			// Handle a deep copy situation
			if (isBoolean(target)) {
				deep = target;
				target = arguments[i] || {};
				i++;
			}

			// Handle case when target is a string or something (possible in deep copy)
			if (typeof target !== "object" && !isFunc(target)) {
				target = {};
			}

			// Extend Util itself if only one argument is passed
			if (i === length) {
				target = this;
				i--;
			}

			for (; i < length; i++) {
				// Only deal with non-null/undefined values
				if ((options = arguments[i]) != null) {
					// Extend the base object
					for (name in options) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];

							}
							else {
								clone = src && isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = this.extendObject(deep, clone, copy);
						}
						// Don't bring in undefined values
						else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		}

		/**
		 * 合并对象，只返回合并后的对象副本
		 * @return  {Object}
		 */
		up.extend = function() {
			var args = AP.slice.call(arguments);
			args.unshift({});
			return this.extendObject.apply(this, args);
		}

		/**
		 * 复制对象或数组
		 * @param   {Object|Array}  target
		 * @return  {Mix}
		 */
		up.copy = function(target) {
			var ret;

			if (isArray(target)) {
				ret = target.slice(0);
			}
			else if (isObject(target)) {
				ret = this.extendObject(true, {}, target);
			}
			else {
				ret = target;
			}

			return ret;
		}

		/**
		 * 字符串首字母大写
		 */
		up.ucFirst = function(str) {
			var first = str.charAt(0).toUpperCase();
			return first + str.substr(1);
		}

		/**
		 * 去掉字符串中所有空格
		 * @param   {String}  string
		 * @return  {String}
		 */
		up.removeSpace = function(string) {
			return string.replace(/\s/g, '');
		}

		/**
		 * 拆解字符键值对，返回键和值
		 * @param   {String}        expression
		 * @param   {Boolean}       both         [是否返回键和值]
		 * @return  {String|Array}
		 */
		up.getStringKeyValue = function(expression, both) {
			var array = expression.split(':');
			return both ? array : array.pop();
		}

		/**
		 * 分解字符串函数参数
		 * @param   {String}  expression
		 * @return  {Array}
		 */
		up.stringToParameters = function(expression) {
			var ret, params, func;
			var matches = expression.match(/(\(.*\))/);
			var result = matches && matches[0];

			// 有函数名和参数
			if (result) {
				params = result.substr(1, result.length - 2).split(',');
				func = expression.substr(0, expression.indexOf(result));
				ret = [func, params];
			}
			// 只有函数名
			else {
				ret = [expression, params];
			}

			return ret;
		}

		/**
		 * 字符JSON结构转为键值数组
		 * @param   {String}  jsonString
		 * @return  {Array}
		 */
		up.jsonStringToArray = function(jsonString) {
			var ret = [], props, leng = jsonString.length;

			if (jsonString.charAt(0) === '{' && jsonString.charAt(leng - 1) === '}') {
				props = jsonString.substr(1, leng - 2).match(/[^,]+:[^:]+((?=,[\w_-]+:)|$)/g);
				this.each(props, function(prop) {
					var vals = this.getStringKeyValue(prop, true);
					var name = vals[0], value = vals[1];
					if (name && value) {
						ret.push({
							'name' : name,
							'value': value
						});
					}
				}, this);
			}
			return ret;
		}

		/**
		 * 创建一个空的dom元素
		 * @param   {String}     tag  [元素标签名称]
		 * @return  {DOMElemnt}
		 */
		up.createElement = function(tag) {
			return DOC.createElement(tag);
		}

		/**
		 * 返回一个空文档碎片
		 * @return  {Fragment}
		 */
		up.createFragment = function() {
			return DOC.createDocumentFragment();
		}

		/**
		 * DOMElement的子节点转换成文档片段
		 * @param   {DOMElement}  element
		 */
		up.nodeToFragment = function(element) {
			var child;
			var fragment = this.createFragment();
			var cloneNode = element.cloneNode(true);

			while (child = cloneNode.firstChild) {
				fragment.appendChild(child);
			}

			return fragment;
		}

		/**
		 * 字符串HTML转文档碎片
		 * @param   {String}    html
		 * @return  {Fragment}
		 */
		up.stringToFragment = function(html) {
			var div, fragment;

			// 存在标签
			if (/<[^>]+>/g.test(html)) {
				div = this.createElement('div');
				div.innerHTML = html;
				fragment = this.nodeToFragment(div);
			}
			// 纯文本节点
			else {
				fragment = this.createFragment();
				fragment.appendChild(DOC.createTextNode(html));
			}

			return fragment;
		}

		util = new Util();

		return util;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Ajax模块
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util) {

		/**
			readyState:
			0: 请求未初始化
			1: 服务器连接已建立
			2: 请求已接收
			3: 请求处理中
			4: 请求已完成，且响应已就绪
		 */

		function Ajax() {
			this.xmlHttp = new XMLHttpRequest();
		}

		var ap = Ajax.prototype;

		/**
		 * 执行一个http请求
		 * @param   {String}    dataType  [回调数据类型json/text]
		 * @param   {String}    url       [请求url]
		 * @param   {String}    method    [请求类型]
		 * @param   {String}    param     [请求参数]
		 * @param   {Function}  callback  [回调函数]
		 * @param   {Function}  context   [作用域]
		 */
		ap._execute = function(dataType, url, method, param, callback, context) {
			var xmlHttp = this.xmlHttp;
			var ct = context || util.WIN;

			// 初始化请求
			xmlHttp.open(method, url, true);

			// 状态变化回调
			xmlHttp.onreadystatechange = function() {
				var response;
				var result = null, error = null, status = xmlHttp.status;

				// 请求完成
				if (xmlHttp.readyState === 4) {
					response = xmlHttp.responseText;

					// 返回数据类型
					if (dataType !== 'text') {
						try {
							response = JSON.parse(response);
						}
						catch (e) {}
					}

					// 请求响应成功
					if (status === 200) {
						result = {
							'success': true,
							'result' : response
						}
					}
					// 响应失败
					else {
						error = {
							'result' : null,
							'success': false,
							'status' : status
						}
					}

					callback.call(ct, error, result);
				}
			}

			if (param) {
				xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}

			xmlHttp.send(param);
		}

		/**
		 * get请求
		 */
		ap.get = function(url, param, callback, context, dataType) {
			var params = [];

			if (util.isFunc(param)) {
				dataType = context;
				context = callback;
				callback = param;
				param = null;
			}

			// 格式化参数对象
			util.each(param, function(val, key) {
				params.push(key + '=' + encodeURIComponent(val));
			});

			if (params.length) {
				url = url + '?' + params.join('&');
			}

			this._execute(dataType || 'json', url, 'GET', null, callback, context);
		}

		/**
		 * post请求
		 */
		ap.post = function(url, param, callback, context) {
			this._execute('json', url, 'POST', param ? JSON.stringify(param) : null, callback, context);
		}

		/**
		 * 拉取静态模板
		 */
		ap.load = function(url, param, callback, context) {
			this.get(url, param, callback, context, 'text');
		}

		return new Ajax();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * sugar顶层模块实例
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1),
		__webpack_require__(4),
		__webpack_require__(5),
		__webpack_require__(7)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util, cache, Module, messager) {

		/**
		 * Core 核心模块，用于顶层模块的创建
		 */
		var Core = Module.extend({
			/**
			 * 获取顶级模块实例
			 * @param  {String}  name  [模块实例名称]
			 * @return {Object}
			 */
			get: function(name) {
				return this.getChild(name);
			},

			/**
			 * 全局广播消息，由core模块发出，系统全部实例接收
			 * @param  {String}   name   [发送的消息名称]
			 * @param  {Mix}      param  [<可选>附加消息参数]
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

		var core = cache['0'] = new Core();

		return core;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * cache 系统模块实例缓存队列
	 * 模块唯一id与全部模块实例的对应关系
	 */
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
		return {'id': 1, 'length': 0}
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * 底层模块定义
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(6),
		__webpack_require__(4),
		__webpack_require__(1),
		__webpack_require__(7)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(Root, cache, util, messager) {

		/**
		 * Module 系统模块基础类，实现所有模块的通用方法
		 */
		var Module = Root.extend({
			/**
			 * _collections 记录模块信息
			 * @type {Object}
			 */
			_collections: {},

			/**
			 * 创建一个子模块实例
			 * @param  {String}  name    [子模块名称，同一模块下创建的子模块名称不能重复]
			 * @param  {Class}   Class   [生成子模块实例的类]
			 * @param  {Object}  config  [<可选>子模块配置参数]
			 * @return {Object}          [返回创建的子模块实例]
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
				if (!util.hasOwn(cls, 'childArray')) {
					// 子模块实例缓存数组
					cls['childArray'] = [];
					// 子模块命名索引
					cls['childMap'] = {};
				}

				// 判断是否已经创建过
				if (cls['childMap'][name]) {
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
				cls['childArray'].push(instance);
				cls['childMap'][name] = instance;

				// 调用模块实例的init方法，传入配置参数和父模块
				if (util.isFunc(instance.init)) {
					instance.init(config, this);
				}

				return instance;
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
			 * @param  {String}  name  [子模块名称]
			 * @return {Object}
			 */
			getChild: function(name) {
				var cls = this._collections;
				return cls && cls['childMap'] && cls['childMap'][name] || null;
			},

			/**
			 * 返回当前模块的所有子模块实例
			 * @param  {Boolean}  returnArray  [返回的集合是否为数组形式，否则返回映射结构]
			 * @return {Mix}
			 */
			getChilds: function(returnArray) {
				var cls = this._collections;
				returnArray = util.isBoolean(returnArray) && returnArray;
				return returnArray ? (cls['childArray'] || []) : (cls['childMap'] || {});
			},

			/**
			 * 移除当前模块实例下的指定子模块的记录
			 * @param  {String}   name  [子模块名称]
			 * @return {Boolean}
			 */
			_removeChild: function(name) {
				var cls = this._collections;
				var cMap = cls['childMap'] || {};
				var cArray = cls['childArray'] || [];
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
			 * @param  {Mix}  notify  [是否向父模块发送销毁消息]
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
				if (util.hasOwn(cache, id)) {
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
			 * @param {Function}  callback  [定时器回调函数]
			 * @param {Number}    time      [<可选>回调等待时间（毫秒）不填为0]
			 * @param {Array}     param     [<可选>回调函数的参数]
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
			 * @param  {String}    name      [发送的消息名称]
			 * @param  {Mix}       param     [<可选>附加消息参数]
			 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
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

		return Module;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * 类式继承根函数
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util) {

		/**
		 * 对子类方法挂载Super
		 * @param   {Function}  Super   [Super函数]
		 * @param   {Mix}       method  [子类属性或者方法]
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

		/*
		 * Root 根函数，实现类式继承
		 * @param  {Object}    proto  [生成类的新原型属性或方法]
		 * @return {Function}  Class  [继承后的类]
		 */
		function Root() {}
		Root.extend = function(proto) {
			var parent = this.prototype;

			/**
			 * 子类对父类的调用
			 * @param {String}  method  [调用的父类方法]
			 * @param {Array}   args    [调用参数]
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

		return Root;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * 模块消息通信 messager
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1),
		__webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util, cache) {

		/**
		 * Messager 通信使者（实现模块间通信）
		 * 默认接收消息onMessage, 默认全部发送完毕回调onMessageSendOut
		 */
		function Messager() {
			/**
			 * 是否正在发送消息
			 * @type {Bool}
			 */
			this.busy = false;

			/**
			 * 等待发送的消息队列
			 * @type {Array}
			 */
			this.queue = [];
		}

		var messager;
		var mp = Messager.prototype;

		/**
		 * 创建一条消息
		 * @param  {String}  type    [消息类型]
		 * @param  {Object}  sender  [发送消息的模块实例]
		 * @param  {String}  name    [发送的消息名称]
		 * @param  {Mix}     param   [<可选>附加消息参数]
		 * @return {Object}
		 */
		mp._create = function(type, sender, name, param) {
			return {
				// 消息类型
				'type'   : type,
				// 消息发起模块实例
				'from'   : sender,
				// 消息目标模块实例
				'to'     : null,
				// 消息被传递的次数
				'count'  : 0,
				// 消息名称
				'name'   : name,
				// 消息参数
				'param'  : param,
				// 接收消息模块的调用方法 on + 首字母大写
				'method' : 'on' + util.ucFirst(name),
				// 接收消息模块的返回值
				'returns': null
			}
		}

		/**
		 * 触发接收消息模块实例的处理方法
		 * @param  {Object}  receiver  [接收消息的模块实例]
		 * @param  {Mix}     msg       [消息体（内容）]
		 * @param  {Mix}     returns   [返回给发送者的数据]
		 * @return {Mix}
		 */
		mp._trigger = function(receiver, msg, returns) {
			// 接收者对该消息的接收方法
			var func = receiver[msg.method];

			// 标识消息的发送目标
			msg.to = receiver;

			// 触发接收者的消息处理方法，若未定义则默认为onMessage
			if (util.isFunc(func)) {
				returns = func.call(receiver, msg);
				msg.count++;
			}
			else if (util.isFunc(receiver.onMessage)) {
				returns = receiver.onMessage.call(receiver, msg);
				msg.count++;
			}

			msg.returns = returns;

			return returns;
		}

		/**
		 * 通知发送者消息已被全部接收完毕
		 * @param  {Mix}       msg       [消息体（内容）]
		 * @param  {Function}  callback  [通知发送者的回调函数]
		 * @param  {Object}    context   [执行环境]
		 */
		mp._notifySender = function(msg, callback, context) {
			// callback未定义时触发默认事件
			if (!callback) {
				callback = context.onMessageSendOut;
			}

			// callback为属性值
			if (util.isString(callback)) {
				callback = context[callback];
			}

			// 合法的回调函数
			if (util.isFunc(callback)) {
				callback.call(context, msg);
			}

			// 继续发送队列中未完成的消息
			if (this.queue.length) {
				setTimeout(this._sendQueue, 0);
			}
			else {
				this.busy = false;
			}
		}

		/**
		 * 发送消息队列
		 */
		mp._sendQueue = function() {
			var request = messager.queue.shift();

			messager.busy = false;

			if (!request) {
				return false;
			}

			// 消息类型
			var type = request.shift();
			// 消息方法
			var func = messager[type];

			if (util.isFunc(func)) {
				func.apply(messager, request);
			}
		}

		/**
		 * 冒泡（由下往上）方式发送消息，由子模块实例发出，逐层父模块实例接收
		 * @param  {Object}    sender    [发送消息的子模块实例]
		 * @param  {String}    name      [发送的消息名称]
		 * @param  {Mix}       param     [<可选>附加消息参数]
		 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
		 * @param  {Object}    context   [执行环境]
		 */
		mp.fire = function(sender, name, param, callback, context) {
			var type = 'fire';

			// 是否处于忙碌状态
			if (this.busy) {
				this.queue.push([type, sender, name, param, callback, context]);
				return false;
			}

			this.busy = true;

			// 创建消息
			var msg = this._create(type, sender, name, param);
			// 消息接收者，先从自身开始接收
			var receiver = sender;
			var returns;

			while (receiver) {
				returns = this._trigger(receiver, msg);
				// 接收消息方法返回false则不再继续冒泡
				if (returns === false) {
					break;
				}

				msg.from = receiver;
				receiver = receiver.getParent();
			}

			this._notifySender(msg, callback, context);
		}

		/**
		 * 广播（由上往下）方式发送消息，由父模块实例发出，逐层子模块实例接收
		 */
		mp.broadcast = function(sender, name, param, callback, context) {
			var type = 'broadcast';

			// 是否处于忙碌状态
			if (this.busy) {
				this.queue.push([type, sender, name, param, callback, context]);
				return false;
			}

			this.busy = true;

			// 创建消息
			var msg = this._create(type, sender, name, param);
			// 消息接收者集合，先从自身开始接收
			var receivers = [sender];
			var receiver, returns;

			while (receivers.length) {
				receiver = receivers.shift();
				returns = this._trigger(receiver, msg);
				// 接收消息方法返回false则不再继续广播
				if (returns === false) {
					break;
				}

				receivers.push.apply(receivers, receiver.getChilds(true));
			}

			this._notifySender(msg, callback, context);
		}

		/**
		 * 向指定模块实例发送消息
		 * @param  {Object}    sender    [发送消息的模块实例]
		 * @param  {String}    receiver  [接受消息的模块实例名称支持.分层级]
		 * @param  {String}    name      [发送的消息名称]
		 * @param  {Mix}       param     [<可选>附加消息参数]
		 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
		 * @param  {Object}    context   [执行环境]
		 */
		mp.notify = function(sender, receiver, name, param, callback, context) {
			var type = 'notify';

			// 是否处于忙碌状态
			if (this.busy) {
				this.queue.push([type, sender, receiver, name, param, callback, context]);
				return false;
			}

			this.busy = true;

			// 根据名称获取系统实例
			function _getInstanceByName(name) {
				var target = null;
				util.each(cache, function(cache) {
					if ((cache._collections && cache._collections.name) === name) {
						target = cache;
						return false;
					}
				});
				return target;
			}

			// 找到receiver，名称可能为superName.fatherName.childName的情况
			var ns = null, tmp, tar;
			if (util.isString(receiver)) {
				ns = receiver.split('.');

				// 有层级
				while (ns.length > 0) {
					if (!tmp) {
						tmp = _getInstanceByName(ns.shift());
						tar = ns.length === 0 ? tmp : (tmp ? tmp.getChild(ns[0]) : null);
					}
					else {
						tar = tmp.getChild(ns.shift());
					}
				}

				if (util.isObject(tar)) {
					receiver = tar;
				}
			}

			if (!util.isObject(receiver)) {
				util.error('module: \'' + receiver + '\' is not found in cache!');
				return false;
			}

			var msg = this._create(type, sender, name, param);

			this._trigger(receiver, msg);

			this._notifySender(msg, callback, context);
		}

		/**
		 * 全局广播发消息，系统全部实例接受
		 * @param  {String}  name   [发送的消息名称]
		 * @param  {Mix}     param  [<可选>附加消息参数]
		 */
		mp.globalCast = function(name, param) {
			var type = 'globalCast';

			// 是否处于忙碌状态
			if (this.busy) {
				this.queue.push([type, name, param]);
				return false;
			}

			this.busy = false;

			var msg = this._create(type, 'core', name, param);

			util.each(cache, function(receiver) {
				this._trigger(receiver, msg);
			});
		}

		messager = new Messager();

		return messager;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * 基础视图模块
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(2),
		__webpack_require__(1),
		__webpack_require__(5),
		__webpack_require__(10)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(dom, ajax, util, Module, MVVM) {

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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * dom操作模块
	 */
	!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
		var dom = Object.create(null);

		/**
		 * 清空element的所有子节点
		 * @param   {DOMElement}  element
		 */
		dom.empty = function(element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		}

		/**
		 * 设置节点属性
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 * @param   {String}      value
		 */
		dom.setAttr = function(node, name, value) {
			node.setAttribute(name, value);
		}

		/**
		 * 获取节点属性值
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 * @return  {String}
		 */
		dom.getAttr = function(node, name) {
			return node.getAttribute(name) || '';
		}

		/**
		 * 判断节点是否存在属性
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 * @return  {Boolean}
		 */
		dom.hasAttr = function(node, name) {
			return node.hasAttribute(name);
		}

		/**
		 * 移除节点属性
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 */
		dom.removeAttr = function(node, name) {
			node.removeAttribute(name);
		}

		/**
		 * 节点添加classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 */
		dom.addClass = function(node, classname) {
			var current, list = node.classList;
			if (list) {
				list.add(classname);
			}
			else {
				current = ' ' + this.getAttr(node, 'class') + ' ';
				if (current.indexOf(' ' + classname + ' ') === -1) {
					this.setAttr(node, 'class', (current + classname).trim());
				}
			}
		}

		/**
		 * 节点删除classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 */
		dom.removeClass = function(node, classname) {
			var current, target, list = node.classList;
			if (list) {
				list.remove(classname);
			}
			else {
				target = ' ' + classname + ' ';
				current = ' ' + this.getAttr(node, 'class') + ' ';
				while (current.indexOf(target) !== -1) {
					current = current.replace(target, ' ');
				}
				this.setAttr(node, 'class', current.trim());
			}

			if (!node.className) {
				this.removeAttr(node, 'class');
			}
		}

		/**
		 * 节点事件绑定
		 * @param   {DOMElement}   node
		 * @param   {String}       evt
		 * @param   {Function}     callback
		 * @param   {Boolean}      capture
		 */
		dom.addEvent = function(node, evt, callback, capture) {
			node.addEventListener(evt, callback, capture);
		}

		/**
		 * 解除节点事件绑定
		 * @param   {DOMElement}   node
		 * @param   {String}       evt
		 * @param   {Function}     callback
		 * @param   {Boolean}      capture
		 */
		dom.removeEvent = function(node, evt, callback, capture) {
			node.removeEventListener(evt, callback, capture);
		}

		return dom;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * 简单的数据绑定视图层库
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(1),
		__webpack_require__(11)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(dom, util, Parser) {

		/**
		 * VM编译模块
		 * @param  {DOMElement}  element  [视图的挂载原生DOM]
		 * @param  {Object}      model    [数据模型对象]
		 */
		function VMCompiler(element, model) {
			if (!this.isElementNode(element)) {
				util.error('element must be a type of DOMElement: ', element);
				return;
			}

			if (!util.isObject(model)) {
				util.error('model must be a type of Object: ', model);
				return;
			}

			// 缓存根节点
			this.$element = element;
			// 元素转为文档碎片
			this.$fragment = util.nodeToFragment(this.$element);

			// VM数据模型
			this.$data = model;
			// DOM对象注册索引
			this.$data.$els = {};

			// 未编译节点缓存队列
			this.$unCompileNodes = [];
			// 根节点是否已完成编译
			this.$rootComplied = false;

			// 解析器
			this.parser = new Parser(this);

			// vmodel限制使用的表单元素
			this.$inputs = 'input|select|textarea'.split('|');

			this.init();
		}

		var vp = VMCompiler.prototype;

		vp.init = function() {
			this.complieElement(this.$fragment, true);
		}

		/**
		 * 编译文档碎片/节点
		 * @param   {Fragment|DOMElement}  element   [文档碎片/节点]
		 * @param   {Boolean}              root      [是否是编译根节点]
		 * @param   {Array}                fors      [vfor数据]
		 */
		vp.complieElement = function(element, root, fors) {
			var node, childNodes = element.childNodes;

			if (root && this.hasDirective(element)) {
				this.$unCompileNodes.push([element, fors]);
			}

			for (var i = 0; i < childNodes.length; i++) {
				node = childNodes[i];

				if (this.hasDirective(node)) {
					this.$unCompileNodes.push([node, fors]);
				}

				if (node.childNodes.length && !this.isLateCompileNode(node)) {
					this.complieElement(node, false, fors);
				}
			}

			if (root) {
				this.compileAllNodes();
			}
		}

		/**
		 * 节点是否含有合法指令
		 * @param   {DOMElement}  node
		 * @return  {Number}
		 */
		vp.hasDirective = function(node) {
			var result, nodeAttrs;
			var text = node.textContent;
			var reg = /(\{\{.*\}\})|(\{\{\{.*\}\}\})/;

			if (this.isElementNode(node)) {
				nodeAttrs = node.attributes;
				for (var i = 0; i < nodeAttrs.length; i++) {
					if (this.isDirective(nodeAttrs[i].name)) {
						result = true;
						break;
					}
				}
			}
			else if (this.isTextNode(node) && reg.test(text)) {
				result = true;
			}
			return result;
		}

		/**
		 * 编译节点缓存队列
		 */
		vp.compileAllNodes = function() {
			util.each(this.$unCompileNodes, function(info) {
				this.complieDirectives(info);
				return null;
			}, this);

			this.checkCompleted();
		}

		/**
		 * 收集并编译节点指令
		 * @param   {Array}  info   [node, fors]
		 */
		vp.complieDirectives = function(info) {
			var node = info[0], fors = info[1];
			var atr, name, vfor, attrs = [], nodeAttrs;

			if (this.isElementNode(node)) {
				// node节点集合转为数组
				nodeAttrs = node.attributes

				for (var i = 0; i < nodeAttrs.length; i++) {
					atr = nodeAttrs[i];
					name = atr.name;
					if (this.isDirective(name)) {
						if (name === 'v-for') {
							vfor = atr;
						}
						attrs.push(atr);
					}
				}

				// vfor编译时标记节点的指令数
				if (vfor) {
					util.defineProperty(node, '_vfor_directives', attrs.length);
					attrs = [vfor];
					vfor = null;
				}

				// 编译节点指令
				util.each(attrs, function(attr) {
					this.compile(node, attr, fors);
				}, this);
			}
			else if (this.isTextNode(node)) {
				this.compileTextNode(node, fors);
			}
		}

		/**
		 * 编译元素节点指令
		 * @param   {DOMElement}      node
		 * @param   {Object}          directive
		 * @param   {Array}           fors
		 */
		vp.compile = function(node, directive, fors) {
			var parser = this.parser;
			var name = directive.name;
			var value = directive.value;
			var args = [node, directive.value, name, fors];

			// 移除指令标记
			dom.removeAttr(node, name);

			if (!value && name !== 'v-else') {
				util.warn('The directive value of ' + name + ' is empty!');
				return;
			}

			// 动态指令：v-bind:xxx
			if (name.indexOf('v-bind') === 0) {
				parser.parseVBind.apply(parser, args);
			}
			// 动态指令：v-on:xxx
			else if (name.indexOf('v-on') === 0) {
				parser.parseVOn.apply(parser, args);
			}
			// 静态指令
			else {
				switch (name) {
					case 'v-el':
						parser.parseVEl.apply(parser, args);
						break;
					case 'v-text':
						parser.parseVText.apply(parser, args);
						break;
					case 'v-html':
						parser.parseVHtml.apply(parser, args);
						break;
					case 'v-show':
						parser.parseVShow.apply(parser, args);
						break;
					case 'v-if':
						parser.parseVIf.apply(parser, args);
						break;
					case 'v-else':
						parser.parseVElse.apply(parser, args);
						break;
					case 'v-model':
						parser.parseVModel.apply(parser, args);
						break;
					case 'v-for':
						parser.parseVFor.apply(parser, args);
						break;
					default: util.warn(name + ' is an unknown directive!');
				}
			}
		}

		/**
		 * 编译文本节点
		 * @param   {DOMElement}   node
		 * @param   {Array}        fors
		 */
		vp.compileTextNode = function(node, fors) {
			var text = node.textContent;
			var regtext = new RegExp('{{(.+?)}}', 'g');
			var regHtml = new RegExp('{{{(.+?)}}}', 'g');
			var matches = text.match(regHtml);
			var match, splits, field, htmlCompile;

			// html match
			if (matches) {
				match = matches[0];
				htmlCompile = true;
				field = match.replace(/\s\{|\{|\{|\}|\}|\}/g, '');
			}
			// text match
			else {
				matches = text.match(regtext);
				match = matches[0];
				field = match.replace(/\s|\{|\{|\}|\}/g, '');
			}

			splits = text.split(match);
			node._vm_text_prefix = splits[0];
			node._vm_text_suffix = splits[splits.length - 1];

			if (htmlCompile) {
				this.parser.parseVHtml(node, field, 'v-html-plain', fors);
			}
			else {
				this.parser.parseVText(node, field, 'v-text-plain', fors);
			}
		}

		/**
		 * 停止编译节点的剩余指令，如vfor的根节点
		 * @param   {DOMElement}  node
		 */
		vp.blockCompileNode = function(node) {
			util.each(this.$unCompileNodes, function(info) {
				if (node === info[0]) {
					return null;
				}
			});
		}

		/**
		 * 是否是元素节点
		 * @param   {DOMElement}   element
		 * @return  {Boolean}
		 */
		vp.isElementNode = function(element) {
			return element.nodeType === 1;
		}

		/**
		 * 是否是文本节点
		 * @param   {DOMElement}   element
		 * @return  {Boolean}
		 */
		vp.isTextNode = function(element) {
			return element.nodeType === 3;
		}

		/**
		 * 是否是合法指令
		 * @param   {String}   directive
		 * @return  {Boolean}
		 */
		vp.isDirective = function(directive) {
			return directive.indexOf('v-') === 0;
		}

		/**
		 * 节点的子节点是否延迟编译
		 * vif, vfor的子节点为处理指令时单独编译
		 * @param   {DOMElement}   node
		 * @return  {Boolean}
		 */
		vp.isLateCompileNode = function(node) {
			return dom.hasAttr(node, 'v-if') || dom.hasAttr(node, 'v-for');
		}

		/**
		 * 检查根节点是否编译完成
		 */
		vp.checkCompleted = function() {
			if (this.$unCompileNodes.length === 0 && !this.$rootComplied) {
				this.rootComplieCompleted();
			}
		}

		/**
		 * 根节点编译完成，更新视图
		 */
		vp.rootComplieCompleted = function() {
			var element = this.$element;
			dom.empty(element);
			this.$rootComplied = true;
			element.appendChild(this.$fragment);
		}

		/**
		 * 设置VM数据值
		 * @param  {String}  field
		 * @param  {Mix}     value
		 */
		vp.setValue = function(field, value) {
			this.$data[field] = value;
		}

		/**
		 * 获取当前VM数据值
		 * @param  {String}  field
		 * @param  {Mix}     value
		 */
		vp.getValue = function(field) {
			return this.$data[field];
		}


		/**
		 * MVVM构造函数，封装VMComplier
		 * @param  {DOMElement}  element  [视图的挂载原生DOM]
		 * @param  {Object}      model    [数据模型对象]
		 * @param  {Function}    context  [VM事件及watch的回调上下文]
		 */
		function MVVM(element, model, context) {
			this.context = context;

			// 将函数this指向调用者
			util.each(model, function(value, key) {
				if (util.isFunc(value)) {
					model[key] = value.bind(context);
				}
			});

			// 初始数据备份
			this._backup = util.copy(model);

			// 内部MVVM实例
			this._vm = new VMCompiler(element, model);

			// VM数据模型
			this.$ = this._vm.$data;
		}

		var mvp = MVVM.prototype;

		/**
		 * 获取指定数据模型
		 * @param   {String}  key  [数据模型字段]
		 * @return  {Mix}
		 */
		mvp.get = function(key) {
			return util.isString(key) ? this.$[key] : this.$;
		}

		/**
		 * 设置数据模型的值，key为JSON时则批量设置
		 * @param  {String}  key    [数据模型字段]
		 * @param  {Mix}     value  [值]
		 */
		mvp.set = function(key, value) {
			var vm = this.$;
			// 批量设置
			if (util.isObject(key)) {
				util.each(key, function(v, k) {
					vm[k] = v;
				});
			}
			else if (util.isString(key)) {
				vm[key] = value;
			}
		}

		/**
		 * 重置数据模型至初始状态
		 * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
		 */
		mvp.reset = function(key) {
			var vm = this.$;
			var backup = this._backup;

			// 重置单个
			if (util.isString(key)) {
				vm[key] = backup[key];
			}
			// 重置多个
			else if (util.isArray(key)) {
				util.each(key, function(v, k) {
					vm[k] = backup[k];
				});
			}
			// 重置所有
			else {
				util.each(vm, function(v, k) {
					vm[k] = backup[k];
				});
			}
		}

		/**
		 * 对数据模型的字段添加监测
		 * @param   {String}    model     [数据模型字段]
		 * @param   {Function}  callback  [触发回调，参数为model, last, old]
		 */
		mvp.watch = function(model, callback) {
			this._vm.parser.watcher.add(model, function(path, last, old) {
				callback.call(this, model, last, old);
			}, this.context);
		}

		return MVVM;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * parser 指令解析模块
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(1),
		__webpack_require__(12),
		__webpack_require__(13)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(dom, util, Updater, Watcher) {

		function Parser(vm) {
			this.vm = vm;
			this.updater = new Updater(vm);
			this.watcher = new Watcher(this.vm.$data);
		}

		var pp = Parser.prototype;

		/**
		 * v-el
		 */
		pp.parseVEl = function(node, value, name, fors) {
			var item, alias, scope, key, splits;

			if (fors) {
				splits = value.split('.');
				alias = splits[0];

				// vel在vfor循环中只能在当前循环体中赋值
				if (alias !== fors[4]) {
					util.warn('The directive \'v-el\' in v-for must be defined in current loop body!');
					return;
				}

				scope = fors[3];
				item = scope[alias];

				if (util.isObject(item)) {
					key = splits[splits.length - 1];
					item[key] = node;
				}
			}
			else {
				this.vm.$data.$els[value] = node;
			}
		}

		/**
		 * v-text, {{text}} DOM文本
		 */
		pp.parseVText = function(node, value, name, fors) {
			var access, replace;
			var watcher = this.watcher;
			var updater = this.updater;
			var inFor = fors && this.isForValue(value, fors);
			var text = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

			if (inFor) {
				access = this.getVforAccess(value, fors);
				replace = this.replaceVforIndex(value, fors[1]);
				if (replace) {
					text = replace;
					// 监测数组下标变更，shift, unshift
					watcher.watcherIndex(access, function(index) {
						updater.updateNodeTextContent(node, this.replaceVforIndex(value, index));
					}, this);
				}
				else {
					// 监测当前vfor对象的访问路径
					watcher.watchAccess(access, function(last) {
						updater.updateNodeTextContent(node, last);
					}, this);
				}
			}
			else {
				// 监测数据模型定义的字段
				watcher.add(value, function(path, last) {
					updater.updateNodeTextContent(node, last);
				}, this);
			}

			updater.updateNodeTextContent(node, text);
		}

		/**
		 * v-html DOM布局
		 */
		pp.parseVHtml = function(node, value, name, fors) {
			var access, replace, isPlain;
			var updater = this.updater;
			var watcher = this.watcher;
			var inFor = fors && this.isForValue(value, fors);
			var html = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

			if (inFor) {
				access = this.getVforAccess(value, fors);
				replace = this.replaceVforIndex(value, fors[1]);
				if (replace) {
					html = replace;
					isPlain = true;
					// v-html如果使用了下标替换则前缀和后缀将编译到与下标同一文本节点
					watcher.watcherIndex(access, function(index) {
						updater.updateNodeHtmlContent(node, this.replaceVforIndex(value, index), isPlain);
					}, this);
				}
				else {
					watcher.watchAccess(access, function(last) {
						updater.updateNodeHtmlContent(node, last);
					}, this);
				}
			}
			else {
				watcher.add(value, function(path, last) {
					updater.updateNodeHtmlContent(node, last);
				}, this);
			}

			updater.updateNodeHtmlContent(node, html, isPlain);
		}

		/**
		 * v-show 控制节点的显示隐藏
		 */
		pp.parseVShow = function(node, value, name, fors) {
			var access;
			var updater = this.updater;
			var watcher = this.watcher;
			var inFor = fors && this.isForValue(value, fors);
			var result = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

			if (inFor) {
				access = this.getVforAccess(value, fors);
				watcher.watchAccess(access, function(last) {
					updater.updateNodeDisplay(node, last);
				}, this);
			}
			else {
				watcher.add(value, function(path, last) {
					updater.updateNodeDisplay(node, last);
				}, this);
			}

			updater.updateNodeDisplay(node, result);
		}

		/**
		 * v-if 控制节点内容的渲染
		 */
		pp.parseVIf = function(node, value, name, fors) {
			var access;
			var updater = this.updater;
			var watcher = this.watcher;
			var inFor = fors && this.isForValue(value, fors);
			var result = inFor ? this.getVforValue(value, fors) : this.vm.getValue(value);

			if (inFor) {
				access = this.getVforAccess(value, fors);
				watcher.watchAccess(access, function(last) {
					updater.updateNodeRenderContent(node, last);
				}, this);
			}
			else {
				this.watcher.add(value, function(path, last) {
					updater.updateNodeRenderContent(node, last);
				}, this);
			}

			updater.updateNodeRenderContent(node, result);
		}

		/**
		 * v-else vshow和vif的else板块
		 */
		pp.parseVElse = function(node) {
			util.defineProperty(node, '_directive', 'v-else');
		}

		/**
		 * v-bind 动态绑定一个或多个attribute
		 * 除class外，一个attribute只能有一个value
		 */
		pp.parseVBind = function(node, value, attr, fors) {
			var directive = util.removeSpace(attr);
			var expression = util.removeSpace(value);
			var val, props = util.jsonStringToArray(expression);

			// 单个attribute v-bind:class="xxx"
			if (directive.indexOf(':') !== -1) {
				val = util.getStringKeyValue(directive);
				// class
				if (val === 'class') {
					// 多个class的json结构
					if (props.length) {
						util.each(props, function(prop) {
							this.bindClassName(node, prop.value, prop.name, fors);
						}, this);
					}
					// 单个class，classname由expression的值决定
					else {
						this.bindClassName(node, expression, null, fors);
					}
				}
				// 行内样式
				else if (val === 'style') {
					// 多个inline-style的json结构
					if (props.length) {
						util.each(props, function(prop) {
							this.bindInlineStyle(node, prop.value, prop.name, fors);
						}, this);
					}
					// 单个inline-style
					else {
						this.bindInlineStyle(node, expression, null, fors);
					}
				}
				// 其他属性
				else {
					this.bindNormalAttribute(node, expression, val, fors);
				}
			}
			// 多个attributes "v-bind={id:xxxx, name: yyy, data-id: zzz}"
			else {
				util.each(props, function(prop) {
					var name = prop.name;
					var value = prop.value;
					if (name === 'class') {
						this.bindClassName(node, value, null, fors);
					}
					else if (name === 'style') {
						this.bindInlineStyle(node, value, null, fors);
					}
					else {
						this.bindNormalAttribute(node, value, name, fors);
					}
				}, this);
			}
		}

		/**
		 * 绑定节点class
		 * @param   {DOMElement}   node
		 * @param   {String}       field
		 * @param   {String}       classname
		 * @param   {Array}        fors
		 */
		pp.bindClassName = function(node, field, classname, fors) {
			var updater = this.updater;
			var value, isObject, isSingle;
			var inFor = fors && this.isForValue(field, fors);

			if (inFor) {
				this.bindClassNameVfor(node, field, classname, fors);
			}
			else {
				value = this.vm.getValue(field);
				isObject = util.isObject(value);
				isSingle = util.isString(value) || util.isBoolean(value);

				// single class
				if (isSingle) {
					updater.updateNodeClassName(node, value, null, classname);
				}
				// classObject
				else if (isObject) {
					this.bindClassNameObject(node, value);
				}
				else {
					util.warn('model \'s '+ field + ' for binding class must be a type of Object, String or Boolean!');
					return;
				}

				this.watcher.add(field, function(path, last, old) {
					if (isObject) {
						// 替换整个classObject
						if (util.isObject(last)) {
							this.bindClassNameObject(node, last, old);
						}
						// 只修改classObject的一个字段
						else if (util.isBoolean(last)) {
							updater.updateNodeClassName(node, last, null, path.split('*').pop());
						}
					}
					else {
						updater.updateNodeClassName(node, last, old, classname);
					}
				}, this);
			}
		}

		/**
		 * vbind-class in v-for
		 */
		pp.bindClassNameVfor = function(node, field, classname, fors) {
			var updater = this.updater;
			var watcher = this.watcher;
			var value = this.getVforValue(field, fors);
			var access = this.getVforAccess(field, fors);

			// 指定classname，由field的布尔值决定是否添加
			if (classname) {
				watcher.watchAccess(access, function(last, old) {
					updater.updateNodeClassName(node, last, old, classname);
				}, this);

				updater.updateNodeClassName(node, value, null, classname);
			}
			else {
				// single class
				if (util.isString(value)) {
					watcher.watchAccess(access, function(last, old) {
						dom.addClass(node, last);
						dom.removeClass(node, old);
					}, this);

					dom.addClass(node, value);
				}
				// classObject
				else if (util.isObject(value)) {
					// 监测classObject单个字段
					this.watchClassNameObject(node, access, value);

					// 监测替换整个classObject
					watcher.watchAccess(access, function(last, old) {
						this.bindClassNameObject(node, last, old);
						this.watchClassNameObject(node, access, last);
					}, this);

					this.bindClassNameObject(node, value);
				}
				else {
					util.warn(access + ' for binding class must be a type of Object, String or Boolean!');
				}
			}
		}

		/**
		 * 监测classObject的每个字段
		 * @todo: 这里当shift和unshift后无法在watcher的displaceCallback中正确的移位
		 * 因为每条vfor数据的classObject的字段会不一样，watcher的移位判断规则需要改进，借助Object.keys
		 * @param   {String}  access
		 * @param   {Object}  classObject
		 */
		pp.watchClassNameObject = function(node, access, classObject) {
			util.each(classObject, function(bool, cls) {
				this.watcher.watchAccess(access + '*' + cls, function(last, old) {
					this.updater.updateNodeClassName(node, last, null, cls);
				}, this);
			}, this);
		}

		/**
		 * 通过classObject批量绑定/移除class
		 * @param   {DOMElement}  node
		 * @param   {object}      newObject  [新classname对象]
		 * @param   {Object}      oldObject  [旧classname对象]
		 */
		pp.bindClassNameObject = function(node, newObject, oldObject) {
			var updater = this.updater;

			// 新增值
			util.each(newObject, function(isAdd, cls) {
				updater.updateNodeClassName(node, isAdd, null, cls);
			}, this);

			// 移除旧值
			util.each(oldObject, function(isAdd, cls) {
				updater.updateNodeClassName(node, false, null, cls);
			}, this);
		}

		/**
		 * 绑定节点style
		 * @param   {DOMElement}  node
		 * @param   {String}      field   [数据绑定字段]
		 * @param   {String}      propperty   [行内样式属性]
		 * @param   {Array}       fors
		 */
		pp.bindInlineStyle = function(node, field, propperty, fors) {
			var updater = this.updater;
			var value, isObject, isString;
			var inFor = fors && this.isForValue(field, fors);

			if (inFor) {
				this.bindInlineStyleVfor(node, field, fors);
			}
			else {
				value = this.vm.getValue(field);
				isObject = util.isObject(value);
				isString = util.isString(value);

				// styleString
				if (isString) {
					updater.updateNodeStyle(node, propperty, value);
				}
				// styleObject
				else if (isObject) {
					this.bindInlineStyleObject(node, value);
				}
				else {
					util.warn('model \'s '+ field + ' for binding style must be a type of Object or String!');
					return;
				}

				this.watcher.add(field, function(path, last, old) {
					if (isObject) {
						// 替换整个styleObject
						if (util.isObject(last)) {
							this.bindInlineStyleObject(node, last, old);
						}
						// 只修改styleObject的一个字段
						else if (util.isString(last)) {
							updater.updateNodeStyle(node, path.split('*').pop(), last);
						}
					}
					else {
						updater.updateNodeStyle(node, propperty, last);
					}
				}, this);
			}
		}

		/**
		 * vbind-style in v-for
		 */
		pp.bindInlineStyleVfor = function(node, field, fors) {
			var updater = this.updater;
			var watcher = this.watcher;
			var key = this.getVforKey(field);
			var style = this.getVforValue(field, fors);
			var access = this.getVforAccess(field, fors);

			if (util.isString(style)) {
				watcher.watchAccess(access, function(last, old) {
					updater.updateNodeStyle(node, key, last);
				}, this);

				updater.updateNodeStyle(node, key, style);
			}
			// styleObject
			else if (util.isObject(style)) {
				// 监测单个字段修改
				this.watchInlineStyleObject(node, access, style);

				// 监测替换整个styleObject
				watcher.watchAccess(access, function(last, old) {
					this.bindInlineStyleObject(node, last, old);
					this.watchInlineStyleObject(node, access, last);
				}, this);

				this.bindInlineStyleObject(node, style);
			}
			else {
				util.warn(access + ' for binding style must be a type of Object or String!');
			}
		}

		/**
		 * 监测styleObject的每个字段
		 * @todo: 问题同watchClassNameObject
		 * @param   {String}  access
		 * @param   {Object}  classObject
		 */
		pp.watchInlineStyleObject = function(node, access, styleObject) {
			util.each(styleObject, function(value, propperty) {
				this.watcher.watchAccess(access + '*' + propperty, function(last, old) {
					this.updater.updateNodeStyle(node, propperty, last);
				}, this);
			}, this);
		}

		/**
		 * 通过styleObject批量绑定/移除行内样式
		 * @param   {DOMElement}  node
		 * @param   {object}      newObject  [新style对象]
		 * @param   {object}      oldObject  [旧style对象]
		 */
		pp.bindInlineStyleObject = function(node, newObject, oldObject) {
			var updater = this.updater;

			// 新值
			util.each(newObject, function(value, propperty) {
				updater.updateNodeStyle(node, propperty, value);
			}, this);

			// 移除旧值
			util.each(oldObject, function(value, propperty) {
				updater.updateNodeStyle(node, propperty, null);
			}, this);
		}

		/**
		 * 绑定节点属性
		 * @param   {DOMElement}  node
		 * @param   {String}      field
		 * @param   {String}      attr
		 * @param   {Array}       fors
		 */
		pp.bindNormalAttribute = function(node, field, attr, fors) {
			var access, replace;
			var watcher = this.watcher;
			var updater = this.updater;
			var inFor = fors && this.isForValue(field, fors);
			var value = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

			if (inFor) {
				access = this.getVforAccess(field, fors);
				// 除class和style外的属性可支持$index的替换
				replace = this.replaceVforIndex(field, fors[1]);
				if (replace) {
					value = replace;
					watcher.watcherIndex(access, function(index) {
						updater.updateNodeAttribute(node, attr, this.replaceVforIndex(field, index));
					}, this);
				}
				else {
					watcher.watchAccess(access, function(last, old) {
						updater.updateNodeAttribute(node, attr, last);
					}, this);
				}
			}
			else {
				watcher.add(field, function(path, last) {
					updater.updateNodeAttribute(node, attr, last);
				}, this);
			}

			updater.updateNodeAttribute(node, attr, value);
		}

		/**
		 * v-on 动态绑定一个或多个事件
		 */
		pp.parseVOn = function(node, value, attr, fors) {
			var val, params, props;
			var evt = util.removeSpace(attr);
			var func = util.removeSpace(value);

			// 单个事件 v-on:click
			if (evt.indexOf(':') !== -1) {
				val = util.getStringKeyValue(evt);
				params = util.stringToParameters(func);
				this.parseVOnEvent(node, params[0], params[1], val, fors);
			}
			// 多个事件 v-on="{click: xxx, mouseenter: yyy, mouseleave: zzz}"
			else {
				props = util.jsonStringToArray(func);
				util.each(props, function(prop) {
					val = prop.name;
					params = util.stringToParameters(prop.value);
					this.parseVOnEvent(node, params[0], params[1], val, fors);
				}, this);
			}
		}

		/**
		 * 节点绑定事件
		 * @todo: 存在$index时数组操作时同步更新参数中的下标
		 */
		pp.parseVOnEvent = function(node, field, args, evt, fors) {
			var access;
			var watcher = this.watcher;
			var updater = this.updater;
			var inFor = fors && this.isForValue(field, fors);
			var func = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

			if (inFor) {
				access = this.getVforAccess(field, fors);
				watcher.watchAccess(access, function(last, old) {
					updater.updateNodeEvent(node, evt, last, old, args, access, fors[1]);
				}, this);
			}
			else {
				watcher.add(field, function(path, last, old) {
					updater.updateNodeEvent(node, evt, last, old, args, field, fors[1]);
				}, this);
			}

			// 即使不在vfor中取值也需要获取访问路径
			if (fors && !access) {
				field = fors[2] + '*' + evt;
			}

			updater.updateNodeEvent(node, evt, func, null, args, field, fors && fors[1]);
		}

		/**
		 * v-model 表单控件双向绑定
		 */
		pp.parseVModel = function(node, field) {
			var inputs = this.vm.$inputs;
			var tagName = node.tagName.toLowerCase();
			var type = tagName === 'input' ? dom.getAttr(node, 'type') : tagName;

			if (inputs.indexOf(tagName) === -1) {
				util.warn('v-model only for using in ' + inputs.join(', '));
				return;
			}

			util.defineProperty(node, '_vmodel', field);

			// 根据不同表单类型绑定数据监测方法
			switch (type) {
				case 'text'    :
				case 'textarea': this.parseVModelText.apply(this, arguments); break;
				case 'radio'   : this.parseVModelRadio.apply(this, arguments); break;
				case 'checkbox': this.parseVModelCheckbox.apply(this, arguments); break;
				case 'select'  : this.parseVModelSelect.apply(this, arguments); break;
			}
		}

		/**
		 * v-model for text, textarea
		 */
		pp.parseVModelText = function(node, field, name, fors) {
			var access;
			var updater = this.updater;
			var watcher = this.watcher;
			var inFor = fors && this.isForValue(field, fors);
			var text = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

			if (inFor) {
				access = this.getVforAccess(field, fors);
				watcher.watchAccess(access, function(last) {
					updater.updateNodeFormTextValue(node, last);
				});
			}
			else {
				watcher.add(field, function(path, last) {
					updater.updateNodeFormTextValue(node, last);
				}, this);
			}

			updater.updateNodeFormTextValue(node, text);

			this.bindVModelTextEvent(node, field, inFor, fors);
		}

		/**
		 * text, textarea绑定数据监测事件
		 * @param   {Input}    node
		 * @param   {String}   field
		 * @param   {Boolean}  inFor
		 * @param   {Array}    fors
		 */
		pp.bindVModelTextEvent = function(node, field, inFor, fors) {
			var self = this, composeLock = false;

			// 解决中文输入时input事件在未选择词组时的触发问题
			// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
			dom.addEvent(node, 'compositionstart', function() {
				composeLock = true;
			});
			dom.addEvent(node, 'compositionend', function() {
				composeLock = false;
			});

			// input事件(实时触发)
			dom.addEvent(node, 'input', function() {
				if (!composeLock) {
					self.setVModelValue(field, this.value, inFor, fors);
				}
			});

			// change事件(失去焦点触发)
			dom.addEvent(node, 'change', function() {
				self.setVModelValue(field, this.value, inFor, fors);
			});
		}

		/**
		 * v-model for radio
		 */
		pp.parseVModelRadio = function(node, field, name, fors) {
			var access;
			var updater = this.updater;
			var watcher = this.watcher;
			var inFor = fors && this.isForValue(field, fors);
			var value = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

			if (inFor) {
				access = this.getVforAccess();
				watcher.watchAccess(access, function(last) {
					updater.updateNodeFormRadioChecked(node, last);
				});
			}
			else {
				watcher.add(field, function(path, last) {
					updater.updateNodeFormRadioChecked(node, last);
				}, this);
			}

			updater.updateNodeFormRadioChecked(node, value);

			this.bindVModelRadioEvent(node, field, inFor, fors);
		}

		/**
		 * radio绑定数据监测事件
		 * @param   {Input}   node
		 * @param   {String}  field
		 */
		pp.bindVModelRadioEvent = function(node, field, inFor, fors) {
			var self = this;
			dom.addEvent(node, 'change', function() {
				self.setVModelValue(field, this.value, inFor, fors);
			});
		}

		/**
		 * v-model for checkbox
		 */
		pp.parseVModelCheckbox = function(node, field, name, fors) {
			var watcher = this.watcher;
			var updater = this.updater;
			var access, scope, key, alias, infos;
			var inFor = fors && this.isForValue(field, fors);
			var value = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

			if (inFor) {
				scope = util.extend(fors[3]);
				key = this.getVforKey(field);
				alias = field.substr(0, field.indexOf(key) - 1);
				infos = [scope, key, alias];

				access = this.getVforAccess(field, fors);
				watcher.watchAccess(access, function() {
					updater.updateNodeFormCheckboxChecked(node, scope[alias][key]);
				}, this);
			}
			else {
				watcher.add(field, function() {
					updater.updateNodeFormCheckboxChecked(node, this.vm.getValue(field));
				}, this);
			}

			updater.updateNodeFormCheckboxChecked(node, value);

			this.bindVModelCheckboxEvent(node, field, inFor, infos);
		}

		/**
		 * checkbox绑定数据监测事件
		 * @param   {Input}    node
		 * @param   {String}   field
		 * @param   {Boolean}  inFor
		 * @param   {Array}    infos
		 */
		pp.bindVModelCheckboxEvent = function(node, field, inFor, infos) {
			var self = this, scope, alias, key;

			if (inFor) {
				scope = infos[0];
				key = infos[1];
				alias = infos[2];
			}

			dom.addEvent(node, 'change', function() {
				var index, value = this.value, checked = this.checked;
				var array = inFor ? scope[alias][key] : self.vm.getValue(field);

				// 多个checkbox
				if (util.isArray(array)) {
					index = array.indexOf(value);
					if (checked) {
						if (index === -1) {
							array.push(value);
						}
					}
					else {
						if (index !== -1) {
							array.splice(index, 1);
						}
					}
				}
				// 单个checkbox
				else if (util.isBoolean(array)) {
					// scope[alias][key] = checked;
					self.setVModelValue(field, checked, inFor, infos);
				}
			});
		}

		/**
		 * v-model for select
		 */
		pp.parseVModelSelect = function(node, field, name, fors) {
			var access;
			var updater = this.updater;
			var watcher = this.watcher;
			var inFor = fors && this.isForValue(field, fors);
			var selectValue = inFor ? this.getVforValue(field, fors) : this.vm.getValue(field);

			var options = node.options;
			var multi = dom.hasAttr(node, 'multiple');
			var option, i, leng = options.length, selects = [], isDefined;

			// 数据模型定义为单选
			if (util.isString(selectValue)) {
				if (multi) {
					util.warn('select cannot be multiple when your model set \'' + field + '\' not Array!');
					return;
				}
				isDefined = Boolean(selectValue);
			}
			// 定义为多选
			else if (util.isArray(selectValue)) {
				if (!multi) {
					util.warn('your model \'' + field + '\' cannot set as Array when select has no multiple propperty!');
					return;
				}
				isDefined = selectValue.length > 0;
			}
			else {
				util.warn(field + ' must be a type of String or Array!');
				return;
			}

			// 数据模型中定义初始的选中状态
			if (isDefined) {
				updater.updateNodeFormSelectChecked(node, selectValue, multi);
			}
			// 模板中定义初始状态
			else {
				// 获取选中状态
				for (i = 0; i < leng; i++) {
					option = options[i];
					if (option.selected) {
						selects.push(option.value);
					}
				}
				this.setVModelValue(field, multi ? selects : selects[0], inFor, fors);
			}

			if (inFor) {
				access = this.getVforAccess(field, fors);
				watcher.watchAccess(access, function(last) {
					updater.updateNodeFormSelectChecked(node, last, multi);
				}, this);
			}
			else {
				watcher.add(field, function(path, last) {
					updater.updateNodeFormSelectChecked(node, last, multi);
				}, this);
			}

			this.bindVModelSelectEvent(node, field, multi, inFor, fors);
		}

		/**
		 * select绑定数据监测事件
		 * @param   {Select}   node
		 * @param   {String}   field
		 * @param   {Boolean}  multi
		 * @param   {Boolean}  inFor
		 * @param   {Array}    fors
		 */
		pp.bindVModelSelectEvent = function(node, field, multi, inFor, fors) {
			var self = this;
			dom.addEvent(node, 'change', function() {
				var selects = self.getSelectValue(this);
				self.setVModelValue(field, multi ? selects : selects[0], inFor, fors);
			});
		}

		/**
		 * 获取SELECT的选中值
		 * @param   {Select}  select
		 * @return  {Array}
		 */
		pp.getSelectValue = function(select) {
			var options = select.options;
			var i, option, leng = options.length, sels = [];
			for (i = 0; i < leng; i++) {
				option = options[i];
				if (option.selected) {
					sels.push(option.value);
				}
			}
			return sels;
		}

		/**
		 * 强制更新select/option在vfor中的值
		 * @param   {Select}  select
		 */
		pp.froceUpdateOption = function(select, fors) {
			var model = select._vmodel;
			var inFor = fors && this.isForValue(model, fors);
			var value = inFor ? this.getVforValue(model, fors) : this.vm.getValue(model);
			this.updater.updateNodeFormSelectChecked(select, value, dom.hasAttr(select, 'multiple'));
		}

		/**
		 * 设置v-model对应数据模型字段的值
		 * @param  {String}   field
		 * @param  {String}   value
		 * @param  {Boolean}  inFor
		 * @param  {Array}    fors
		 */
		pp.setVModelValue = function(field, value, inFor, fors) {
			var key;
			if (inFor) {
				key = this.getVforKey(field);
				fors[0][key] = value;
			}
			else {
				this.vm.setValue(field, value);
			}
		}

		/**
		 * v-for 基于源数据重复的动态列表
		 */
		pp.parseVFor = function(node, value, attr, fors) {
			var match = value.match(/(.*) in (.*)/);
			var alias = match[1];
			var field = match[2];
			var scope = {}, level = 0;
			var watcher = this.watcher;
			var parent = node.parentNode;
			var key = this.getVforKey(field);
			var isOption = node.tagName === 'OPTION';
			var template, infos, array = this.vm.getValue(field);

			if (key) {
				scope = fors[3];
				level = fors[5];
				array = fors[0][key];
				field = fors[2] + '*' + key;
			}

			if (!util.isArray(array)) {
				parent.removeChild(node);
				return;
			}

			template = this.buildVforTemplate(node, array, field, scope, alias, level);

			node.parentNode.replaceChild(template, node);

			if (isOption) {
				this.froceUpdateOption(parent, fors);
			}

			// differ数组信息
			infos = [field, scope, alias, level];

			// 监测根列表数据的变化
			if (!fors) {
				watcher.add(field, function(path, last, old) {
					// 更新数组的某一项
					if (path !== field) {
						watcher.triggerAccess(path, last, old);
					}
					// 更新整个根数组
					else {
						this.differVfors(parent, node, last, old, infos);
					}
				}, this);
			}
			// 嵌套vfor
			else {
				watcher.watchAccess(field, function(last, old) {
					this.differVfors(parent, node, last, old, infos);
				}, this);
			}
		}

		/**
		 * 根据源数组构建循环板块集合
		 * @param   {DOMElement}  node   [重复模板]
		 * @param   {Array}       array  [源数组]
		 * @param   {String}      field  [访问路径]
		 * @param   {Object}      scope  [循环中对象取值范围]
		 * @param   {String}      alias  [当前循环对象别名]
		 * @param   {Number}      level  [当前循环层级]
		 * @return  {Fragment}           [板块集合]
		 */
		pp.buildVforTemplate = function(node, array, field, scope, alias, level) {
			var vm = this.vm;
			var fragments = util.createFragment();

			level++;

			// 构建重复片段
			util.each(array, function(item, index) {
				var path = field + '*' + index;
				var cloneNode = node.cloneNode(true);
				var fors = [item, index, path, scope, alias, level];

				// 阻止重复编译除vfor以外的指令
				if (node._vfor_directives > 1) {
					vm.blockCompileNode(node);
				}

				// 可在编译过程中获取当前循环对象的所有信息
				// 当编译结束之后别名对应的取值对象是循环体的最后一项
				scope[alias] = item;
				// 传入vfor数据编译板块
				vm.complieElement(cloneNode, true, fors);
				// 定义私有标记属性
				util.defineProperty(cloneNode, '_vfor_alias', alias);

				fragments.appendChild(cloneNode);
			}, this);

			return fragments;
		}

		/**
		 * 数组操作同步更新vfor循环体
		 * @param   {DOMElement}  parent    [父节点]
		 * @param   {DOMElement}  node      [初始模板片段]
		 * @param   {Array}       newArray  [新的数据重复列表]
		 * @param   {String}      method    [数组操作]
		 * @param   {Array}       infos    [differ信息]
		 */
		pp.differVfors = function(parent, node, newArray, method, infos) {
			var firstChild, lastChild;
			var watcher = this.watcher;
			var field = infos[0], alias = infos[2];

			switch (method) {
				case 'push':
					this.pushVforArray.apply(this, arguments);
					break;
				case 'pop':
					lastChild = this.getVforLastChild(parent, alias);
					parent.removeChild(lastChild);
					break;
				case 'unshift':
					watcher.backwardArray(field);
					this.unshiftVforArray.apply(this, arguments);
					break;
				case 'shift':
					firstChild = this.getVforFirstChild(parent, alias);
					watcher.forwardArray(field);
					parent.removeChild(firstChild);
					break;
				// @todo: splice, sort, reverse操作和直接赋值暂时都重新编译
				default:
					this.recompileVforArray.apply(this, arguments);
			}
		}

		/**
		 * 获取vfor循环体的第一个子节点
		 * @param   {DOMElement}  parent  [父节点]
		 * @param   {String}      alias   [循环体对象别名]
		 * @return  {FirstChild}
		 */
		pp.getVforFirstChild = function(parent, alias) {
			var i, firstChild, child;
			var childNodes = parent.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				child = childNodes[i];
				if (child._vfor_alias === alias) {
					firstChild = child;
					break;
				}
			}
			return firstChild;
		}

		/**
		 * 获取vfor循环体的最后一个子节点
		 * @param   {DOMElement}  parent   [父节点]
		 * @param   {String}      alias    [循环体对象别名]
		 * @return  {LastChild}
		 */
		pp.getVforLastChild = function(parent, alias) {
			var i, lastChild, child;
			var childNodes = parent.childNodes;
			for (i = childNodes.length - 1; i > -1 ; i--) {
				child = childNodes[i];
				if (child._vfor_alias === alias) {
					lastChild = child;
					break;
				}
			}
			return lastChild;
		}

		/**
		 * 在循环体数组的最后追加一条数据 array.push
		 */
		pp.pushVforArray = function(parent, node, newArray, method, infos) {
			var lastChild;
			var last = newArray.length - 1;
			var fragment = util.createFragment();
			var cloneNode = node.cloneNode(true);
			var field = infos[0], scope = infos[1], alias = infos[2], level = infos[3];
			var fors = [newArray[last], last, field + '*' + last, scope, alias, level];

			// 循环体定义
			scope[alias] = newArray[last];

			// 解析节点
			this.vm.complieElement(cloneNode, true, fors);
			fragment.appendChild(cloneNode);

			lastChild = this.getVforLastChild(parent, alias);
			parent.insertBefore(fragment, lastChild.nextSibling);
		}

		/**
		 * 在循环体数组最前面追加一条数据 array.unshift
		 */
		pp.unshiftVforArray = function(parent, node, newArray, method, infos) {
			var firstChild;
			var fragment = util.createFragment();
			var cloneNode = node.cloneNode(true);
			var field = infos[0], scope = infos[1], alias = infos[2], level = infos[3];
			var fors = [newArray[0], 0, field + '*' + 0, scope, alias, level, method];

			// 循环体定义
			scope[alias] = newArray[0];

			// 解析节点
			this.vm.complieElement(cloneNode, true, fors);
			fragment.appendChild(cloneNode);

			firstChild = this.getVforFirstChild(parent, alias);
			parent.insertBefore(fragment, firstChild);
		}

		/**
		 * 重新编译循环体数组
		 */
		pp.recompileVforArray = function(parent, node, newArray, method, infos) {
			var template, alias = infos[2];
			var childNodes = parent.childNodes;
			var scapegoat, child, args = [node, newArray];

			// 重新构建循环板块
			util.AP.push.apply(args, infos);
			template = this.buildVforTemplate.apply(this, args);

			// 移除旧板块
			for (var i = 0; i < childNodes.length; i++) {
				child = childNodes[i];
				if (child._vfor_alias === alias) {
					if (!scapegoat) {
						scapegoat = child;
					}
					else {
						i--;
						parent.removeChild(child);
					}
				}
			}

			if (scapegoat) {
				parent.replaceChild(template, scapegoat);
			}
			else {
				parent.appendChild(template);
			}

		}

		/**
		 * 是否是在vfor中取值
		 * @param   {String}   field  [model字段或者vfor字段]
		 * @param   {Array}    fors   [vfor数据]
		 * @return  {Boolean}
		 */
		pp.isForValue = function(field, fors) {
			var pos = field.indexOf('.');
			var alias = pos === -1 ? (field === fors[4] ? field : null) : field.substr(0, pos);
			return field.indexOf('$index') === -1 ? (alias ? util.hasOwn(fors[3], alias) : false) : true;
		}

		/**
		 * 获取vfor中循环对象的键名
		 * @param   {String}  field
		 * @param   {Object}  item
		 * @return  {String}
		 */
		pp.getVforKey = function(field) {
			var pos = field.lastIndexOf('.');
			return pos === -1 ? '' : field.substr(pos + 1);
		}

		/**
		 * 获取vfor中循环对象的值，当前循环取值或跨层级取值
		 */
		pp.getVforValue = function(value, fors) {
			var splits = value.split('.');
			var sl = splits.length;
			var alias = splits[0], key = splits[sl - 1];
			var scopeMap = fors[3], scope = (scopeMap && scopeMap[alias]) || fors[0];
			return sl === 1 ? scope : scope[key];
		}

		/**
		 * 获取vfor中当前循环对象的监测访问路径
		 */
		pp.getVforAccess = function(value, fors) {
			var path = fors[2], alias, access;
			var splits, leng, level, key, suffix;

			if (value.indexOf('$index') !== -1) {
				access = path;
			}
			else {
				splits = value.split('.');
				leng = splits.length;
				level = fors[5];
				alias = splits[0];
				key = splits[leng - 1];
				suffix = leng === 1 ? '' : '*' + key;
				access = alias === fors[4] ? (fors[2] + suffix) : (path.split('*', level).join('*') + suffix);
			}

			return access;
		}

		/**
		 * 替换vfor循环体表达式中的下标
		 * @param   {String}          expression
		 * @param   {String|Number}   index
		 * @return  {String}
		 */
		pp.replaceVforIndex = function(expression, index) {
			return expression.indexOf('$index') === -1 ? null : expression.replace(/\$index/g, index);
		}

		return Parser;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * updater 视图刷新模块
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(9),
		__webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(dom, util) {

		function Updater(vm) {
			this.vm = vm;
			// 事件绑定回调集合
			this.$listeners = {};
		}

		var up = Updater.prototype;

		/**
		 * 更新节点的文本内容 realize v-text
		 * @param   {DOMElement}  node
		 * @param   {String}      text
		 */
		up.updateNodeTextContent = function(node, text) {
			node.textContent = (node._vm_text_prefix || '') + String(text) + (node._vm_text_suffix || '');
		}

		/**
		 * 更新节点的html内容 realize v-html
		 * isPlain用于判断v-html在纯文本节点使用{{{$index}}}的情况
		 * 因为用了replaceChild后下标变更时将无法找回原有的节点进行更新下标
		 * @param   {DOMElement}  node
		 * @param   {String}      html
		 * @param   {Boolean}     isPlain    [是否是纯文本节点]
		 */
		up.updateNodeHtmlContent = function(node, html, isPlain) {
			var vm = this.vm;
			html = String(html);

			if (vm.isElementNode(node)) {
				dom.empty(node);
				node.appendChild(util.stringToFragment(html));
			}
			else if (vm.isTextNode(node)) {
				if (isPlain) {
					this.updateNodeTextContent(node, html);
				}
				else {
					html = (node._vm_text_prefix || '') + html + (node._vm_text_suffix || '');
					// @todo: <p>****{{{html}}}***</p> 这种与文本参杂的情况也将无法找回原有节点
					node.parentNode.replaceChild(util.stringToFragment(html), node);
				}
			}
		}

		/**
		 * 更新节点的显示隐藏 realize v-show/v-else
		 * @param   {DOMElement}  node
		 * @param   {Boolean}     show    [是否显示]
		 */
		up.updateNodeDisplay = function(node, show) {
			var siblingNode = node.nextSibling;

			this.setNodeVisibleDisplay(node);
			this.updateNodeStyle(node, 'display', show ? node._visible_display : 'none');

			// v-else
			if (siblingNode && (dom.hasAttr(siblingNode, 'v-else') || siblingNode._directive === 'v-else')) {
				this.setNodeVisibleDisplay(siblingNode);
				this.updateNodeStyle(siblingNode, 'display', show ? 'none' : siblingNode._visible_display);
			}
		}

		/**
		 * 缓存节点行内样式值
		 * 行内样式display=''不会影响由classname中的定义
		 * _visible_display用于缓存节点行内样式的display显示值
		 * @param  {DOMElement}  node
		 */
		up.setNodeVisibleDisplay = function(node) {
			var inlineStyle, styles, display;

			if (!node._visible_display) {
				inlineStyle = util.removeSpace(dom.getAttr(node, 'style'));

				if (inlineStyle && inlineStyle.indexOf('display') !== -1) {
					styles = inlineStyle.split(';');

					util.each(styles, function(style) {
						if (style.indexOf('display') !== -1) {
							display = util.getStringKeyValue(style);
						}
					});
				}

				if (display !== 'none') {
					node._visible_display = display || '';
				}
			}
		}

		/**
		 * 更新节点内容的渲染 realize v-if/v-else
		 * @param   {DOMElement}  node
		 * @param   {Boolean}     isRender  [是否渲染]
		 */
		up.updateNodeRenderContent = function(node, isRender) {
			var siblingNode = node.nextSibling;

			this.setNodeRenderContent(node);
			this.toggleNodeRenderContent.apply(this, arguments);

			// v-else
			if (siblingNode && (dom.hasAttr(siblingNode, 'v-else') || siblingNode._directive === 'v-else')) {
				this.setNodeRenderContent(siblingNode);
				this.toggleNodeRenderContent(siblingNode, !isRender);
			}
		}

		/**
		 * 缓存节点渲染内容并清空
		 */
		up.setNodeRenderContent = function(node) {
			if (!node._render_content) {
				node._render_content = node.innerHTML;
			}
			dom.empty(node);
		}

		/**
		 * 切换节点内容渲染
		 */
		up.toggleNodeRenderContent = function(node, isRender) {
			var fragment;
			// 渲染
			if (isRender) {
				fragment = util.stringToFragment(node._render_content);
				this.vm.complieElement(fragment, true);
				node.appendChild(fragment);
			}
		}

		/**
		 * 更新节点的attribute realize v-bind
		 * @param   {DOMElement}  node
		 * @param   {String}      attribute
		 * @param   {String}      value
		 */
		up.updateNodeAttribute = function(node, attribute, value) {
			if (value === null) {
				dom.removeAttr.apply(this, arguments);
			}
			else {
				// setAttribute不适合用于表单元素的value
				// https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
				if (attribute === 'value' && (this.vm.$inputs.indexOf(node.tagName.toLowerCase()) !== -1)) {
					node.value = value;
				}
				else {
					dom.setAttr.apply(this, arguments);
				}
			}
		}

		/**
		 * 更新节点的classname realize v-bind:class
		 * @param   {DOMElement}          node
		 * @param   {String|Boolean}      newValue
		 * @param   {String|Boolean}      oldValue
		 * @param   {String}              classname
		 */
		up.updateNodeClassName = function(node, newValue, oldValue, classname) {
			// 指定classname，变化值由newValue布尔值决定
			if (classname) {
				if (newValue === true) {
					dom.addClass(node, classname);
				}
				else if (newValue === false) {
					dom.removeClass(node, classname);
				}
			}
			// 未指定classname，变化值由newValue的值决定
			else {
				if (newValue) {
					dom.addClass(node, newValue);
				}

				if (oldValue) {
					dom.removeClass(node, oldValue);
				}
			}
		}

		/**
		 * 更新节点的style realize v-bind:style
		 * @param   {DOMElement}  node
		 * @param   {String}      propperty  [属性名称]
		 * @param   {String}      value      [样式值]
		 */
		up.updateNodeStyle = function(node, propperty, value) {
			node.style[propperty] = value;
		}

		/**
		 * 更新节点绑定事件的回调函数 realize v-on
		 * @param   {DOMElement}  node
		 * @param   {String}      evt
		 * @param   {Function}    func     [回调函数]
		 * @param   {Function}    oldFunc  [旧回调函数]
		 * @param   {Array}       params   [参数]
		 * @param   {String}      field    [对应监测字段/路径]
		 * @param   {Number}      index    [vfor下标]
		 */
		up.updateNodeEvent = function(node, evt, func, oldFunc, params, field, index) {
			var listeners = this.$listeners;
			var modals, self, stop, prevent, capture = false;

			// 支持4种事件修饰符.self.stop.prevent.capture
			if (evt.indexOf('.') !== -1) {
				modals = evt.split('.');
				evt = modals.shift();
				self = modals && modals.indexOf('self') !== -1;
				stop = modals && modals.indexOf('stop') !== -1;
				prevent = modals && modals.indexOf('prevent') !== -1;
				capture = modals && modals.indexOf('capture') !== -1;
			}

			if (oldFunc) {
				dom.removeEvent(node, evt, listeners[field], capture);
			}

			if (util.isFunc(func)) {
				// 缓存事件回调
				listeners[field] = function _listener(e) {
					var args = [];

					// 是否限定只能在当前节点触发事件
					if (self && e.target !== node) {
						return;
					}

					// 组合事件参数
					util.each(params, function(param) {
						args.push(param === '$event' ? e : param === '$index' ? index : param);
					});

					// 未指定参数，则原生事件对象作为唯一参数
					if (!args.length) {
						args.push(e);
					}

					func.apply(this, args);

					// 是否阻止冒泡
					if (stop) {
						e.stopPropagation();
					}
					// 是否阻止默认事件
					if (prevent) {
						e.preventDefault();
					}
				}

				dom.addEvent(node, evt, listeners[field], capture);
			}
			else {
				util.warn('The model: ' + field + '\'s value for using v-on must be a type of Function!');
			}
		}

		/**
		 * 更新text或textarea的value realize v-model
		 * @param   {Input}  text
		 * @param   {String} value
		 */
		up.updateNodeFormTextValue = function(text, value) {
			if (text.value !== value) {
				text.value = value;
			}
		}

		/**
		 * 更新radio的激活状态 realize v-model
		 * @param   {Input}  radio
		 * @param   {String} value
		 */
		up.updateNodeFormRadioChecked = function(radio, value) {
			radio.checked = radio.value === (util.isNumber(value) ? String(value) : value);
		}

		/**
		 * 更新checkbox的激活状态 realize v-model
		 * @param   {Input}          checkbox
		 * @param   {Array|Boolean}  values      [激活数组或状态]
		 */
		up.updateNodeFormCheckboxChecked = function(checkbox, values) {
			if (!util.isArray(values) && !util.isBoolean(values)) {
				util.warn('checkbox v-model value must be a type of Boolean or Array!');
				return;
			}
			checkbox.checked = util.isBoolean(values) ? values : (values.indexOf(checkbox.value) !== -1);
		}

		/**
		 * 更新select的激活状态 realize v-model
		 * @param   {Select}         select
		 * @param   {Array|String}   selected  [选中值]
		 * @param   {Boolean}        multi
		 */
		up.updateNodeFormSelectChecked = function(select, selected, multi) {
			var options = select.options;
			var i, option, value, leng = options.length;

			for (i = 0; i < leng; i++) {
				option = options[i];
				value = option.value;
				option.selected = multi ? selected.indexOf(value) !== -1 : selected === value;
			}
		}

		return Updater;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * watcher 数据订阅模块
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1),
		__webpack_require__(14)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util, Observer) {

		function Watcher(model) {
			this.$model = model;

			// 监测数据模型回调集合
			this.$watchCallbacks = {};

			// 监测访问路径回调集合
			this.$accessCallbacks = {};

			// 监测数组下标路径集合
			this.$indexCallbacks = {};

			this.observer = new Observer(model, ['$els'], 'triggerAgent', this);
		}

		var wp = Watcher.prototype;

		/**
		 * 添加一个对数据模型字段的监测回调
		 * @param  {String}    field     [监测字段]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [作用域]
		 * @param  {Array}     args      [回调参数]
		 */
		wp.add = function(field, callback, context, args) {
			var model = this.$model;
			var callbacks = this.$watchCallbacks;

			if (!util.hasOwn(model, field)) {
				util.warn('The field: ' + field + ' does not exist in model!');
				return;
			}

			if (field.indexOf('*') !== -1) {
				util.warn('model key cannot contain the character \'*\'!');
				return;
			}

			// 缓存回调函数
			if (!callbacks[field]) {
				callbacks[field] = [];
			}

			callbacks[field].push([callback, context, args]);
		}

		/**
		 * 数据模型变化触发代理
		 * 只触发数据模型定义的字段，数组内部变化通过triggerAccess手动触发
		 * @param   {String}  path  [触发字段访问路径]
		 * @param   {Mix}     last  [新值]
		 * @param   {Mix}     old   [旧值]
		 */
		wp.triggerAgent = function(path, last, old) {
			var pos = path.indexOf('*');
			var field = pos === -1 ? path : path.substr(0, pos);

			// 触发所有回调
			util.each(this.$watchCallbacks[field], function(cbs) {
				var callback = cbs[0], context = cbs[1], args = cbs[2];
				callback.call(context, path, last, old, args);
			}, this);
		}

		/**
		 * 订阅数据模型多层访问路径回调
		 * @param  {String}    access    [访问路径]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [作用域]
		 * @param  {Array}     args      [回调参数]
		 */
		wp.watchAccess = function(access, callback, context, args) {
			var callbacks = this.$accessCallbacks;

			// 缓存回调函数
			if (!callbacks[access]) {
				callbacks[access] = [];
			}

			callbacks[access].push([callback, context, args]);
		}

		/**
		 * 触发多层访问路径变更回调
		 * @param   {String}  access  [访问路径]
		 * @param   {Mix}     last    [新值]
		 * @param   {Mix}     old     [旧值]
		 */
		wp.triggerAccess = function(access, last, old) {
			var callbacks = this.$accessCallbacks;

			util.each(callbacks[access], function(cb) {
				var callback = cb[0], context = cb[1], args = cb[2];
				callback.call(context, last, old, args);
			});
		}

		/**
		 * 订阅数组操作下标变更回调
		 * @param  {String}    access    [访问路径]
		 * @param  {Function}  callback  [变化回调]
		 * @param  {Object}    context   [作用域]
		 */
		wp.watcherIndex = function(access, callback, context) {
			var callbacks = this.$indexCallbacks;

			// 缓存回调函数
			if (!callbacks[access]) {
				callbacks[access] = [];
			}

			callbacks[access].push([callback, context]);
		}

		/**
		 * 访问路径回调延后一位，处理数组的unshift操作
		 */
		wp.backwardArray = function(field) {
			this.updateArrayAccess(field, true);
			return this;
		}

		/**
		 * 访问路径回调提前一位，处理数组的shift操作
		 */
		wp.forwardArray = function(field) {
			this.updateArrayAccess(field, false);
			return this;
		}

		/**
		 * 更新访问路径和回调函数的对应关系
		 * 处理数组的unshift/shift操作
		 * vfor数组的回调监测分为访问路径和下标两种监测
		 * @param   {String}   field     [数组访问路径]
		 * @param   {Boolean}  backward  [是否延后一位]
		 */
		wp.updateArrayAccess = function(field, backward) {
			var prefix = field + '*';
			this.displaceIndex(prefix, backward);
			this.displaceCallback(prefix, backward);
		}

		/**
		 * 移位访问路径的回调集合
		 * @param   {String}   prefix    [移位路径的前缀]
		 * @param   {Boolean}  backward
		 */
		wp.displaceCallback = function(prefix, backward) {
			var callbacks = this.$accessCallbacks;
			var accesses = Object.keys(callbacks);

			var targets = [], cbCaches = {};

			// 需要移位的所有访问路径和回调
			util.each(accesses, function(access) {
				if (access.indexOf(prefix) === 0) {
					targets.push(access);
					cbCaches[access] = callbacks[access];
				}
			});

			util.each(targets, function(current) {
				var udf;
				var index = +current.substr(prefix.length).charAt(0);
				var suffix = current.substr(prefix.length + 1);
				var first = prefix + 0 + suffix;
				var next = prefix + (index + 1) + suffix;

				// 延后一位，第一位将为undefined
				if (backward) {
					callbacks[next] = cbCaches[current];
					if (index === 0) {
						callbacks[first] = udf;
					}
				}
				// 提前一位，最后一位将为undefined
				else {
					callbacks[current] = cbCaches[next];
				}
			}, this);
		}

		/**
		 * 移位下标监测的回调集合
		 * @param   {String}   prefix    [移位路径的前缀]
		 * @param   {Boolean}  backward
		 */
		wp.displaceIndex = function(prefix, backward) {
			var indexCallbacks = this.$indexCallbacks;
			var indexes = Object.keys(indexCallbacks);

			// 需要移位的下标监测
			util.each(indexes, function(index) {
				if (index.indexOf(prefix) !== 0) {
					return;
				}

				var udf;
				var idx = +index.substr(prefix.length).charAt(0);
				var suffix = index.substr(prefix.length + 1);
				var first = prefix + 0;
				var next = prefix + (idx + 1) + suffix;

				// 延后一位
				if (backward) {
					indexCallbacks[next] = indexCallbacks[index];
					if (index === 0) {
						indexCallbacks[first] = udf;
					}

					util.each(indexCallbacks[index], function(cbs) {
						cbs[0].call(cbs[1], idx);
					});
				}
				// 提前一位
				else {
					indexCallbacks[index] = indexCallbacks[next];

					util.each(indexCallbacks[index], function(cbs) {
						cbs[0].call(cbs[1], idx);
					});
				}
			});
		}

		return Watcher;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * observer 数据变化监测模块
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(util) {

		/**
		 * @param  {Object}        object    [VM数据模型]
		 * @param  {Array}         ignores   [忽略监测的字段]
		 * @param  {Function}      callback  [变化回调函数]
		 * @param  {Object}        context   [执行上下文]
		 * @param  {Object}        args      [<可选>回调参数]
		 */
		function Observer(object, ignores, callback, context, args) {
			if (util.isString(callback)) {
				callback = context[callback];
			}

			this.$ignores = ignores;
			this.$callback = callback;
			this.$context = context;
			this.$args = args;

			// 监测的对象集合，包括一级和嵌套对象
			this.$observers = [object];

			// 监测的数据副本，存储旧值
			this.$valuesMap = {'0': util.copy(object)};

			// 记录当前数组操作
			this.$arrayAction = 921;
			// 避免触发下标的数组操作
			this.$aviodArrayAction = ['shift', 'unshift', 'splice'];
			// 重写的Array方法
			this.$fixArrayMethods = 'push|pop|shift|unshift|splice|sort|reverse'.split('|');

			// 路径层级分隔符
			this.$separator = '*';

			this.observe(object);
		}

		var op = Observer.prototype;

		/**
		 * 监测数据模型
		 * @param   {Object}  object  [监测的对象]
		 * @param   {Array}   paths   [访问路径数组]
		 */
		op.observe = function(object, paths) {
			if (util.isArray(object)) {
				this.rewriteArrayMethods(object, paths);
			}

			util.each(object, function(value, property) {
				var copies = paths && paths.slice(0);
				if (copies) {
					copies.push(property);
				}
				else {
					copies = [property];
				}

				if (!this.isIgnore(copies)) {
					this.setCache(object, value, property).bindWatching(object, copies);
				}

			}, this);

			return this;
		}

		/**
		 * 检查paths是否在排除范围内
		 * @param   {Array}    paths  [访问路径数组]
		 * @return  {Boolean}
		 */
		op.isIgnore = function(paths) {
			var ret, path = paths.join(this.$separator);

			util.each(this.$ignores, function(ignore) {
				if (ignore.indexOf(path) === 0) {
					ret = true;
					return false;
				}
			}, this);

			return ret;
		}

		/**
		 * 获取指定对象的属性缓存值
		 * @param   {Object}  object    [指定对象]
		 * @param   {String}  property  [属性名称]
		 * @return  {Object}
		 */
		op.getCache = function(object, property) {
			var index = this.$observers.indexOf(object);
			var value = (index === -1) ? null : this.$valuesMap[index];
			return value ? value[property] : value;
		}

		/**
		 * 设置指定对象的属性与值的缓存映射
		 * @param  {Object}  object    [指定对象]
		 * @param  {Mix}     value     [值]
		 * @param  {String}  property  [属性名称]
		 */
		op.setCache = function(object, value, property) {
			var observers = this.$observers;
			var valuesMap = this.$valuesMap;
			var oleng = observers.length;
			var index = observers.indexOf(object);

			// 不存在，建立记录
			if (index === -1) {
				observers.push(object);
				valuesMap[oleng] = util.copy(object);
			}
			// 记录存在，重新赋值
			else {
				valuesMap[index][property] = value;
			}

			return this;
		}

		/**
		 * 对属性绑定监测方法
		 * @param   {Object|Array}  object  [对象或数组]
		 * @param   {Array}         paths   [访问路径数组]
		 */
		op.bindWatching = function(object, paths) {
			var prop = paths[paths.length - 1];

			// 定义object的getter和setter
			Object.defineProperty(object, prop, {
				get: (function getter() {
					return this.getCache(object, prop);
				}).bind(this),

				set: (function setter() {
					var newValue = arguments[0];
					var oldValue = this.getCache(object, prop);

					if (newValue !== oldValue) {
						if (util.isObject(newValue) || util.isArray(newValue)) {
							this.observe(newValue, paths);
						}

						this.setCache(object, newValue, prop);

						if (this.$aviodArrayAction.indexOf(this.$arrayAction) === -1) {
							this.triggerChange(paths.join(this.$separator), newValue, oldValue);
						}
					}
				}).bind(this)
			});

			var value = object[prop];

			// 嵌套数组或对象
			if (util.isArray(value) || util.isObject(value)) {
				this.observe(value, paths);
			}
		}

		/**
		 * 重写指定的Array方法
		 * @param   {Array}  array  [目标数组]
		 * @param   {Array}  paths  [访问路径数组]
		 */
		op.rewriteArrayMethods = function(array, paths) {
			var arrayProto = util.AP;
			var arrayMethods = Object.create(arrayProto);
			var path = paths && paths.join(this.$separator);

			util.each(this.$fixArrayMethods, function(method) {
				var self = this, original = arrayProto[method];
				util.defineProperty(arrayMethods, method, function _redefineArrayMethod() {
					var i = arguments.length, result;
					var args = new Array(i);

					while (i--) {
						args[i] = arguments[i];
					}

					self.$arrayAction = method;

					result = original.apply(this, args);

					self.$arrayAction = 921;

					// 重新监测
					self.observe(this, paths);

					// 触发回调
					self.triggerChange(path, this, method);

					return result;
				}, true, false, true);
			}, this);

			array.__proto__ = arrayMethods;

			return this;
		}

		/**
		 * 触发object变化回调
		 * @param   {String}       path      [变更路径]
		 * @param   {Mix}          last      [新值]
		 * @param   {Mix|String}   old       [旧值/数组操作名称]
		 */
		op.triggerChange = function(path, last, old) {
			this.$callback.apply(this.$context, [path, last, old, this.$args]);
		}

		return Observer;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }
/******/ ])
});
;