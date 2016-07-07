/*!
 * sugar.js v1.1.3
 * (c) 2016 TANG
 * Released under the MIT license
 * https://github.com/tangbc/sugar
 * Thu Jul 07 2016 16:08:57 GMT+0800 (CST)
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Sugar = factory());
}(this, function () { 'use strict';

	var OP = Object.prototype;
	var hasOwn = OP.hasOwnProperty;

	/**
	 * 是否是对象
	 */
	function isObject(object) {
		return OP.toString.call(object) === '[object Object]';
	}

	/**
	 * 是否是数组
	 */
	function isArray(array) {
		return Array.isArray(array);
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
		return typeof str === 'string';
	}

	/**
	 * 是否是布尔值
	 */
	function isBool(bool) {
		return typeof bool === 'boolean';
	}

	/**
	 * 是否是数字
	 */
	function isNumber(num) {
		return typeof num === 'number' && !isNaN(num);
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
	 * 是否是空对象
	 * @param   {Object}   object
	 * @return  {Boolean}
	 */
	function isEmpty(object) {
		return Object.keys(object).length === 0;
	}


	var util = {
		isBool: isBool,
		isFunc: isFunc,
		isArray: isArray,
		isEmpty: isEmpty,
		isNumber: isNumber,
		isObject: isObject,
		isString: isString
	}

	/**
	 * 打印警告信息
	 */
	util.warn = function() {
		console.warn.apply(console, arguments);
	}

	/*
	 * 对象自有属性检测
	 */
	util.hasOwn = function(obj, key) {
		return obj && hasOwn.call(obj, key);
	}

	/**
	 * object 定义或修改属性
	 * @param   {Object|Array}  object        [数组或对象]
	 * @param   {String}        property      [属性或数组下标]
	 * @param   {Mix}           value         [属性的修改值/新值]
	 * @param   {Boolean}       writable      [该属性是否能被赋值运算符改变]
	 * @param   {Boolean}       enumerable    [该属性是否出现在枚举中]
	 * @param   {Boolean}       configurable  [该属性是否能够被改变或删除]
	 */
	util.def = function(object, property, value, writable, enumerable, configurable) {
		return Object.defineProperty(object, property, {
			'value'       : value,
			'writable'    : !!writable,
			'enumerable'  : !!enumerable,
			'configurable': !!configurable
		});
	}

	/**
	 * 将 object[property] 定义为一个不可枚举的属性
	 */
	util.defRec = function(object, property, value) {
		return this.def(object, property, value, true, false, true);
	}

	/**
	 * 删除 object 所有属性
	 * @param   {Object}   object
	 */
	util.clear = function(object) {
		this.each(object, function() {
			return null;
		});
	}

	/**
	 * 遍历数组或对象，提供删除选项和退出遍历的功能
	 * @param  {Array|Object}  items     [数组或对象]
	 * @param  {Fuction}       callback  [回调函数]
	 * @param  {Object}        context   [作用域]
	 */
	util.each = function(items, callback, context) {
		var this$1 = this;

		var ret, i;

		if (!items) {
			return;
		}

		if (!context) {
			context = this;
		}

		if (isString(callback)) {
			callback = context[callback];
		}

		// 数组
		if (isArray(items)) {
			for (i = 0; i < items.length; i++) {
				ret = callback.call(context, items[i], i, items);

				// 回调返回 false 退出循环
				if (ret === false) {
					break;
				}

				// 回调返回 null 从原数组删除当前选项
				if (ret === null) {
					items.splice(i, 1);
					i--;
				}
			}
		}
		// 对象
		else if (isObject(items)) {
			for (i in items) {
				if (!this$1.hasOwn(items, i)) {
					continue;
				}

				ret = callback.call(context, items[i], i, items);

				// 回调返回 false 退出循环
				if (ret === false) {
					break;
				}

				// 回调返回 null 从原对象删除当前选项
				if (ret === null) {
					delete items[i];
				}
			}
		}
	}

	/**
	 * 扩展合并对象，摘自 jQuery
	 */
	util.extend = function() {
		var arguments$1 = arguments;
		var this$1 = this;

		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

		// Handle a deep copy situation
		if (isBool(target)) {
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
			if ((options = arguments$1[i]) != null) {
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
						target[name] = this$1.extend(deep, clone, copy);
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
	 * 复制对象或数组
	 * @param   {Object|Array}  target
	 * @return  {Mix}
	 */
	util.copy = function(target) {
		var ret;

		if (isArray(target)) {
			ret = target.slice(0);
		}
		else if (isObject(target)) {
			ret = this.extend(true, {}, target);
		}

		return ret || target;
	}

	/**
	 * 去掉字符串中所有空格
	 * @param   {String}  string
	 * @return  {String}
	 */
	util.removeSpace = function(string) {
		return string.replace(/\s/g, '');
	}

	/**
	 * 拆解字符键值对，返回键和值
	 * @param   {String}        expression
	 * @param   {Boolean}       both         [是否返回键和值]
	 * @return  {String|Array}
	 */
	util.getKeyValue = function(expression, both) {
		var array = expression.split(':');
		return both ? array : array.pop();
	}

	/**
	 * 创建一个空的 dom 元素
	 * @param   {String}     tag  [元素标签名称]
	 * @return  {DOMElemnt}
	 */
	util.createElement = function(tag) {
		return document.createElement(tag);
	}

	/**
	 * 返回一个空文档碎片
	 * @return  {Fragment}
	 */
	util.createFragment = function() {
		return document.createDocumentFragment();
	}

	/**
	 * element 的子节点转换成文档片段（element 将会被清空）
	 * @param   {DOMElement}  element
	 */
	util.nodeToFragment = function(element) {
		var child;
		var fragment = this.createFragment();

		while (child = element.firstChild) {
			fragment.appendChild(child);
		}

		return fragment;
	}

	/**
	 * 字符串 html 转文档碎片
	 * @param   {String}    html
	 * @return  {Fragment}
	 */
	util.stringToFragment = function(html) {
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
			fragment.appendChild(document.createTextNode(html));
		}

		return fragment;
	}

	/**
	 * 获取指令表达式的别名/模型字段
	 * eg. item.text -> item, items.length -> items
	 * @param   {String}  expression
	 * @return  {String}
	 */
	util.getExpAlias = function(expression) {
		var pos = expression.indexOf('.');
		return pos === -1 ? expression : expression.substr(0, pos);
	}

	/**
	 * 获取指令表达式的取值字段，无返回空
	 * eg. item.text -> text,
	 * @param   {String}  expression
	 * @return  {String}
	 */
	util.getExpKey = function(expression) {
		var pos = expression.lastIndexOf('.');
		return pos === -1 ? '' : expression.substr(pos + 1);
	}

	/**
	 * 返回两个对象的差异字段的集合
	 * 用于获取 v-bind 绑定 object 的更新差异
	 * @param   {Object}  newObject
	 * @param   {Object}  oldObject
	 * @return  {Object}
	 */
	util.diff = function(newObject, oldObject) {
		return {
			'n': this.getUnique(newObject, oldObject),
			'o': this.getUnique(oldObject, newObject)
		}
	}

	/**
	 * 返回 contrastObject 相对于 referObject 的差异对象
	 * @param   {Object}  contrastObject  [对比对象]
	 * @param   {Object}  referObject     [参照对象]
	 * @return  {Object}
	 */
	util.getUnique = function(contrastObject, referObject) {
		var unique = {};

		this.each(contrastObject, function(value, key) {
			var diff, oldItem = referObject[key];

			if (isObject(value)) {
				diff = this.getUnique(value, oldItem);
				if (!isEmpty(diff)) {
					unique[key] = diff;
				}
			}
			else if (isArray(value)) {
				var newArray = [];

				this.each(value, function(nItem, index) {
					var diff;

					if (isObject(nItem)) {
						diff = this.getUnique(nItem, oldItem[index]);
						newArray.push(diff);
					}
					else {
						// 新数组元素
						if (oldItem.indexOf(nItem) === -1) {
							newArray.push(nItem);
						}
					}
				}, this);

				unique[key] = newArray;
			}
			else {
				if (value !== oldItem) {
					unique[key] = value;
				}
			}
		}, this);

		return unique;
	}

	/**
	 * 生成取值路径
	 * @param   {String}  access
	 * @return  {Array}
	 */
	util.makePaths = function(access) {
		var this$1 = this;

		var length, paths = access && access.split('*');

		if (!paths || paths.length < 2) {
			return [];
		}

		for (var i = paths.length - 1; i > -1; i--) {
			if (this$1.isNumber(+paths[i])) {
				length = i + 1;
				break;
			}
		}

		return paths.slice(0, length);
	}

	/**
	 * 通过访问层级取值
	 * @param   {Object}  target
	 * @param   {Array}   paths
	 * @return  {Mix}
	 */
	util.getDeepValue = function(target, paths) {
		var _paths = paths.slice(0);

		while (_paths.length) {
			target = target[_paths.shift()];
		}

		return target;
	}

	/**
	 * 生成取值路径数组
	 * [items, 0, ps, 0] => [[items, 0], [items, 0, ps, 0]]
	 * @param   {Array}  paths
	 * @return  {Array}
	 */
	util.makeScopePaths = function(paths) {
		var index = 0, scopePaths = [];

		if (paths.length % 2 === 0) {
			while (index < paths.length) {
				index += 2;
				scopePaths.push(paths.slice(0, index));
			}
		}

		return scopePaths;
	}

	/**
	 * Ajax 模块
	 */
	function Ajax() {}

	var ap = Ajax.prototype;

	/**
	 * 执行一个 http 请求
	 * @param   {String}    dataType  [回调数据类型 json/text ]
	 * @param   {String}    url       [请求url]
	 * @param   {String}    method    [请求类型]
	 * @param   {String}    param     [请求参数]
	 * @param   {Function}  callback  [回调函数]
	 * @param   {Function}  context   [作用域]
	 */
	ap._execute = function(dataType, url, method, param, callback, context) {
		var ct = context || this;
		var xmlHttp = new XMLHttpRequest();

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
	 * get 请求
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
	 * post 请求
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

	var ajax = new Ajax();

	var cache = {'id': 1, 'length': 0}

	/**
	 * 对子类方法挂载 Super
	 * @param   {Function}  Super   [Super 函数]
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
	 * Root 实现类式继承
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

	/**
	 * 字符串首字母大写
	 */
	function ucFirst(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	}

	/**
	 * 根据组件名称获取组件实例
	 * @param   {String}  name
	 */
	function getComponent(name) {
		var component = null;
		util.each(cache, function(instance) {
			if ((instance._ && instance._.name) === name) {
				component = instance;
				return false;
			}
		});
		return component;
	}


	/**
	 * Messager 实现组件消息通信
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
	 * @param  {Object}  sender  [发送消息的组件实例]
	 * @param  {String}  name    [发送的消息名称]
	 * @param  {Mix}     param   [<可选>附加消息参数]
	 * @return {Object}
	 */
	mp.createMsg = function(type, sender, name, param) {
		return {
			// 消息类型
			'type'   : type,
			// 消息发起组件实例
			'from'   : sender,
			// 消息目标组件实例
			'to'     : null,
			// 消息被传递的次数
			'count'  : 0,
			// 消息名称
			'name'   : name,
			// 消息参数
			'param'  : param,
			// 接收消息组件的调用方法 on + 首字母大写
			'method' : 'on' + ucFirst(name),
			// 发送完毕后的返回数据
			'returns': null
		}
	}

	/**
	 * 触发接收消息组件实例的处理方法
	 * @param  {Object}  receiver  [接收消息的组件实例]
	 * @param  {Mix}     msg       [消息体（内容）]
	 * @return {Mix}
	 */
	mp.trigger = function(receiver, msg) {
		// 接受者消息处理方法
		var func = receiver[msg.method];

		// 触发接收者的消息处理方法
		if (util.isFunc(func)) {
			// 标识消息的发送目标
			msg.to = receiver;
			// 发送次数
			++msg.count;
			return func.call(receiver, msg);
		}
	}

	/**
	 * 通知发送者消息已被全部接收完毕
	 * @param  {Mix}       msg       [消息体（内容）]
	 * @param  {Function}  callback  [通知发送者的回调函数]
	 * @param  {Object}    context   [执行环境]
	 */
	mp.notifySender = function(msg, callback, context) {
		// 通知回调
		if (util.isFunc(callback)) {
			callback.call(context, msg);
		}

		// 继续发送队列中未完成的消息
		if (this.queue.length) {
			setTimeout(this.sendQueue, 0);
		}
		else {
			this.busy = false;
		}
	}

	/**
	 * 发送消息队列
	 */
	mp.sendQueue = function() {
		var request = messager.queue.shift();

		messager.busy = false;

		if (!request) {
			return false;
		}

		// 消息类型
		var type = request.shift();
		// 消息方法
		var func = messager[type];

		func.apply(messager, request);
	}

	/**
	 * 冒泡（由下往上）方式发送消息，由子组件实例发出，逐层父组件实例接收
	 * @param  {Object}    sender    [发送消息的子组件实例]
	 * @param  {String}    name      [发送的消息名称]
	 * @param  {Mix}       param     [<可选>附加消息参数]
	 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
	 * @param  {Object}    context   [执行环境]
	 */
	mp.fire = function(sender, name, param, callback, context) {
		var this$1 = this;

		var type = 'fire';

		// 是否处于忙碌状态
		if (this.busy ) {
			this.queue.push([type, sender, name, param, callback, context]);
			return;
		}

		this.busy = true;

		// 创建消息
		var msg = this.createMsg(type, sender, name, param);
		// 消息接收者，先从上一层模块开始接收
		var receiver = sender.getParent();

		while (receiver) {
			var ret = this$1.trigger(receiver, msg);

			// 接收消息方法返回 false 则不再继续冒泡
			if (ret === false) {
				this$1.notifySender(msg, callback, context);
				return;
			}

			msg.from = receiver;
			receiver = receiver.getParent();
		}

		this.notifySender(msg, callback, context);
	}

	/**
	 * 广播（由上往下）方式发送消息，由父组件实例发出，逐层子组件实例接收
	 */
	mp.broadcast = function(sender, name, param, callback, context) {
		var this$1 = this;

		var type = 'broadcast';

		// 是否处于忙碌状态
		if (this.busy) {
			this.queue.push([type, sender, name, param, callback, context]);
			return;
		}

		this.busy = true;

		// 创建消息
		var msg = this.createMsg(type, sender, name, param);
		// 消息接收者集合，先从自身的子模块开始接收
		var receivers = sender.getChilds(true).slice(0);

		while (receivers.length) {
			var receiver = receivers.shift();
			var ret = this$1.trigger(receiver, msg);

			// 接收消息方法返回 false 则不再继续广播
			if (ret !== false) {
				msg.from = receiver;
				Array.prototype.push.apply(receivers, receiver.getChilds(true));
			}
		}

		this.notifySender(msg, callback, context);
	}

	/**
	 * 向指定组件实例发送消息
	 * @param  {Object}    sender    [发送消息的组件实例]
	 * @param  {String}    receiver  [接受消息的组件实例名称支持.分层级]
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
			return;
		}

		this.busy = true;

		// 找到 receiver，名称可能为 superName.fatherName.childName 的情况
		if (util.isString(receiver)) {
			var target;
			var paths = receiver.split('.');
			var parent = getComponent(paths.shift());

			// 有层级
			if (paths.length) {
				util.each(paths, function(comp) {
					target = parent.getChild(comp);
					parent = target;
					return null;
				});
			}
			else {
				target = parent;
			}

			parent = null;

			if (util.isObject(target)) {
				receiver = target;
			}
		}

		var msg = this.createMsg(type, sender, name, param);

		if (!util.isObject(receiver)) {
			this.notifySender(msg, callback, context);
			return util.warn('component: [' + receiver + '] is not exist!');
		}

		this.trigger(receiver, msg);

		this.notifySender(msg, callback, context);
	}

	/**
	 * 全局广播发消息，系统全部组件实例接受
	 * @param  {String}  name   [发送的消息名称]
	 * @param  {Mix}     param  [<可选>附加消息参数]
	 */
	mp.globalCast = function(name, param, callback, context) {
		var type = 'globalCast';

		// 是否处于忙碌状态
		if (this.busy) {
			this.queue.push([type, name, param, callback, context]);
			return;
		}

		this.busy = true;

		var msg = this.createMsg(type, '__core__', name, param);

		util.each(cache, function(receiver, index) {
			if (util.isObject(receiver) && index !== '0') {
				this.trigger(receiver, msg);
			}
		}, this);

		// 发送完毕回调
		this.notifySender(msg, callback, context);
	}

	messager = new Messager();

	var messager$1 = messager;

	/**
	 * Module 系统组件模块基础类，实现所有模块的通用方法
	 */
	var Module = Root.extend({
		/**
		 * _ 记录模块信息
		 * @type {Object}
		 */
		_: {},

		/**
		 * 创建一个子模块实例
		 * @param  {String}  name    [子模块名称，同一模块下创建的子模块名称不能重复]
		 * @param  {Class}   Class   [生成子模块实例的类]
		 * @param  {Object}  config  [<可选>子模块配置参数]
		 * @return {Object}          [返回创建的子模块实例]
		 */
		create: function(name, Class, config) {
			if (!util.isString(name)) {
				return util.warn('module\'s name must be a type of String: ', name);
			}
			if (!util.isFunc(Class)) {
				return util.warn('module\'s Class must be a type of Component: ', Class);
			}

			var cls = this._;

			// 建立模块关系信息
			if (!util.hasOwn(cls, 'childArray')) {
				// 子模块实例缓存数组
				cls['childArray'] = [];
				// 子模块命名索引
				cls['childMap'] = {};
			}

			// 判断是否已经创建过
			if (cls['childMap'][name]) {
				return util.warn('module ['+ name +'] is already exists!');
			}

			// 生成子模块实例
			var instance = new Class(config);

			// 记录子模块实例信息和父模块实例的对应关系
			var info = {
				// 子模块实例名称
				'name': name,
				// 子模块实例id
				'id'  : cache.id++,
				// 父模块实例 id，0 为顶级模块实例
				'pid' : cls.id || 0
			}
			instance._ = info;

			// 存入系统实例缓存队列
			cache[info.id] = instance;
			cache.length++;

			// 缓存子模块实例
			cls['childArray'].push(instance);
			cls['childMap'][name] = instance;

			// 调用模块实例的 init 方法，传入配置参数和父模块
			if (util.isFunc(instance.init)) {
				instance.init(config, this);
			}

			return instance;
		},

		/**
		 * 获取当前模块的父模块实例（模块创建者）
		 */
		getParent: function() {
			var cls = this._;
			var pid = cls && cls.pid;
			return cache[pid] || null;
		},

		/**
		 * 获取当前模块创建的指定名称的子模块实例
		 * @param  {String}  name  [子模块名称]
		 * @return {Object}
		 */
		getChild: function(name) {
			var cls = this._;
			return cls && cls['childMap'] && cls['childMap'][name] || null;
		},

		/**
		 * 返回当前模块的所有子模块实例
		 * @param  {Boolean}  returnArray  [返回的集合是否为数组形式，否则返回映射结构]
		 * @return {Mix}
		 */
		getChilds: function(returnArray) {
			var cls = this._;
			returnArray = util.isBool(returnArray) && returnArray;
			return returnArray ? (cls['childArray'] || []) : (cls['childMap'] || {});
		},

		/**
		 * 移除当前模块实例下的指定子模块的记录
		 * @param  {String}   name  [子模块名称]
		 * @return {Boolean}
		 */
		_removeChild: function(name) {
			var cls = this._;
			var cMap = cls['childMap'] || {};
			var cArray = cls['childArray'] || [];
			var child = cMap[name];

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
			var cls = this._;
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

			// 移除所有属性
			util.clear(this);
		},

		/**
		 * 冒泡（由下往上）方式发送消息，由子模块发出，逐层父模块接收
		 * @param  {String}    name      [发送的消息名称]
		 * @param  {Mix}       param     [<可选>附加消息参数]
		 * @param  {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]
		 */
		fire: function(name, param, callback) {
			// 不传 param
			if (util.isFunc(param)) {
				callback = param;
				param = null;
			}

			// callback 为属性值
			if (util.isString(callback)) {
				callback = this[callback];
			}

			messager$1.fire(this, name, param, callback, this);
		},

		/**
		 * 广播（由上往下）方式发送消息，由父模块发出，逐层子模块接收
		 */
		broadcast: function(name, param, callback) {
			// 不传 param
			if (util.isFunc(param)) {
				callback = param;
				param = null;
			}

			// callback 为属性值
			if (util.isString(callback)) {
				callback = this[callback];
			}

			messager$1.broadcast(this, name, param, callback, this);
		},

		/**
		 * 向指定模块实例发送消息
		 * @param   {String}    receiver  [消息接受模块实例的名称以.分隔，要求完整的层级]
		 * @param   {String}    name      [发送的消息名称]
		 * @param   {Mix}       param     [<可选>附加消息参数]
		 * @param   {Function}  callback  [<可选>发送完毕的回调函数，可在回调中指定回应数据]]
		 */
		notify: function(receiver, name, param, callback) {
			// 不传 param
			if (util.isFunc(param)) {
				callback = param;
				param = null;
			}

			// callback 为属性值
			if (util.isString(callback)) {
				callback = this[callback];
			}

			messager$1.notify(this, receiver, name, param, callback, this);
		}
	});

	/**
	 * Core 核心模块，用于顶层组件模块的创建
	 */
	var Core = Module.extend({
		/**
		 * 获取顶级组件实例
		 * @param  {String}  name  [组件实例名称]
		 * @return {Object}
		 */
		get: function(name) {
			return this.getChild(name);
		},

		/**
		 * 全局广播消息，由 core 实例发出，系统全部实例接收
		 * @param  {String}    name      [发送的消息名称]
		 * @param  {Mix}       param     [<可选>附加消息参数]
		 * @param  {Function}  callback  [<可选>发送完毕的回调函数]
	 	 * @param  {Object}    context   [<可选>执行环境]
		 * @return {Boolean}
		 */
		globalCast: function(name, param, callback, context) {
			// 不传 param
			if (util.isFunc(param)) {
				context = callback;
				callback = param;
				param = null;
			}

			messager$1.globalCast(name, param, callback, context);
		},

		/**
		 * 重写 destroy, core 模块不允许销毁
		 */
		destroy: function() {}
	});

	var core = cache['0'] = new Core();

	var dom = {
		/**
		 * 清空 element 的所有子节点
		 * @param   {DOMElement}  element
		 */
		empty: function(element) {
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
			return element;
		},

		/**
		 * 设置节点属性
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 * @param   {String}      value
		 */
		setAttr: function(node, name, value) {
			if (typeof value === 'boolean') {
				node[name] = value;
			}
			else if (value !== this.getAttr(node, name)) {
				node.setAttribute(name, value);
			}
		},

		/**
		 * 获取节点属性值
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 * @return  {String}
		 */
		getAttr: function(node, name) {
			return node.getAttribute(name) || '';
		},

		/**
		 * 判断节点是否存在属性
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 * @return  {Boolean}
		 */
		hasAttr: function(node, name) {
			return node.hasAttribute(name);
		},

		/**
		 * 移除节点属性
		 * @param   {DOMElement}  node
		 * @param   {String}      name
		 */
		removeAttr: function(node, name) {
			node.removeAttribute(name);
		},

		/**
		 * 节点添加 classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 */
		addClass: function(node, classname) {
			var current, list = node.classList;

			if (this.hasClass(node, classname)) {
				return;
			}

			/* istanbul ignore else */
			if (list) {
				list.add(classname);
			}
			else {
				current = ' ' + this.getAttr(node, 'class') + ' ';
				if (current.indexOf(' ' + classname + ' ') === -1) {
					this.setAttr(node, 'class', (current + classname).trim());
				}
			}
		},

		/**
		 * 节点删除 classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 */
		removeClass: function(node, classname) {
			var current, target, list = node.classList;

			if (!this.hasClass(node, classname)) {
				return;
			}

			/* istanbul ignore else */
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
		},

		/**
		 * 节点是否存在 classname
		 * @param  {DOMElement}  node
		 * @param  {String}      classname
		 * @return {Boolean}
		 */
		hasClass: function(node, classname) {
			var current, list = node.classList;
			/* istanbul ignore else */
			if (list) {
				return list.contains(classname);
			}
			else {
				current = ' ' + this.getAttr(node, 'class') + ' ';
				return current.indexOf(' ' + classname + ' ') !== -1;
			}
		},

		/**
		 * 节点事件绑定
		 * @param   {DOMElement}   node
		 * @param   {String}       evt
		 * @param   {Function}     callback
		 * @param   {Boolean}      capture
		 */
		addEvent: function(node, evt, callback, capture) {
			node.addEventListener(evt, callback, capture);
		},

		/**
		 * 解除节点事件绑定
		 * @param   {DOMElement}   node
		 * @param   {String}       evt
		 * @param   {Function}     callback
		 * @param   {Boolean}      capture
		 */
		removeEvent: function(node, evt, callback, capture) {
			node.removeEventListener(evt, callback, capture);
		}
	}

	/**
	 * 事件处理模块
	 */
	function Eventer() {
		this.$map = {};
		this.$guid = 1000;
		this.$listeners = {};
	}

	var ep = Eventer.prototype;

	/**
	 * 获取一个唯一的标识
	 * @return  {Number}
	 */
	ep.guid = function() {
		return this.$guid++;
	}

	/**
	 * 添加一个事件绑定回调
	 * @param  {DOMElement}   node
	 * @param  {String}       evt
	 * @param  {Function}     callback
	 * @param  {Boolean}      capture
	 * @param  {Mix}          context
	 */
	ep.add = function(node, evt, callback, capture, context) {
		var map = this.$map;
		var guid = this.guid();
		var listeners = this.$listeners;

		map[guid] = callback;

		listeners[guid] = function _proxy(e) {
			callback.call(context || this, e);
		}

		dom.addEvent(node, evt, listeners[guid], capture);
	}

	/**
	 * 移除事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	ep.remove = function(node, evt, callback, capture) {
		var guid, map = this.$map;
		var listeners = this.$listeners;

		// 找到对应的 callback id
		util.each(map, function(cb, id) {
			if (cb === callback) {
				guid = id;
				return false;
			}
		});

		if (guid) {
			dom.removeEvent(node, evt, listeners[guid], capture);
			delete map[guid];
			delete listeners[guid];
		}
	}

	/**
	 * 清除所有事件记录
	 */
	ep.clear = function() {
		this.$guid = 1000;
		util.clear(this.$map);
		util.clear(this.$listeners);
	}

	var eventer = new Eventer();

	/**
	 * 移除 DOM 注册的引用
	 * @param   {Object}      vm
	 * @param   {DOMElement}  element
	 */
	function removeDOMRegister(vm, element) {
		var registers = vm.$data.$els;
		var childNodes = element.childNodes;

		for (var i = 0; i < childNodes.length; i++) {
			var node = childNodes[i];

			if (!vm.isElementNode(node)) {
				continue;
			}

			var nodeAttrs = node.attributes;

			for (var ii = 0; ii < nodeAttrs.length; ii++) {
				var attr = nodeAttrs[ii];
				if (attr.name === 'v-el' && util.hasOwn(registers, attr.value)) {
					registers[attr.value] = null;
				}
			}

			if (node.childNodes.length) {
				removeDOMRegister(vm, node);
			}
		}
	}


	/**
	 * updater 视图刷新模块
	 */
	function Updater(vm) {
		this.vm = vm;
	}

	var up = Updater.prototype;

	/**
	 * 更新节点的文本内容 realize v-text
	 * @param   {DOMElement}  node
	 * @param   {String}      text
	 */
	up.updateTextContent = function(node, text) {
		node.textContent = String(text);
	}

	/**
	 * 更新节点的 html 内容 realize v-html
	 * 处理 {{{html}}} 指令时 node 为文本的父节点
	 * @param   {DOMElement}  node
	 * @param   {String}      html
	 */
	up.updateHtmlContent = function(node, html) {
		dom.empty(node).appendChild(util.stringToFragment(String(html)));
	}

	/**
	 * 更新节点的显示隐藏 realize v-show/v-else
	 * @param   {DOMElement}  node
	 * @param   {Boolean}     show    [是否显示]
	 */
	up.updateDisplay = function(node, show) {
		var siblingNode = this.getSibling(node);

		this.setVisible(node);
		this.updateStyle(node, 'display', show ? node._visible_display : 'none');

		// v-else
		if (siblingNode && (dom.hasAttr(siblingNode, 'v-else') || siblingNode._directive === 'v-else')) {
			this.setVisible(siblingNode);
			this.updateStyle(siblingNode, 'display', show ? 'none' : siblingNode._visible_display);
		}
	}

	/**
	 * 缓存节点行内样式值
	 * 行内样式 display='' 不会影响由 classname 中的定义
	 * _visible_display 用于缓存节点行内样式的 display 显示值
	 * @param  {DOMElement}  node
	 */
	up.setVisible = function(node) {
		if (!node._visible_display) {
			var display;
			var inlineStyle = util.removeSpace(dom.getAttr(node, 'style'));

			if (inlineStyle && inlineStyle.indexOf('display') !== -1) {
				var styles = inlineStyle.split(';');

				util.each(styles, function(style) {
					if (style.indexOf('display') !== -1) {
						display = util.getKeyValue(style);
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
	up.updateRenderContent = function(node, isRender) {
		var siblingNode = this.getSibling(node);

		this.setRender(node);
		this.toggleRender.apply(this, arguments);

		// v-else
		if (siblingNode && (dom.hasAttr(siblingNode, 'v-else') || siblingNode._directive === 'v-else')) {
			this.setRender(siblingNode);
			this.toggleRender(siblingNode, !isRender);
		}
	}

	/**
	 * 缓存节点渲染内容并清空
	 */
	up.setRender = function(node) {
		if (!node._render_content) {
			node._render_content = node.innerHTML;
		}
		dom.empty(node);
	}

	/**
	 * 切换节点内容渲染
	 */
	up.toggleRender = function(node, isRender) {
		var vm = this.vm;
		var fragment = util.stringToFragment(node._render_content);

		// 渲染
		if (isRender) {
			vm.complieElement(fragment, true);
			node.appendChild(fragment);
		}
		// 不渲染的情况需要移除 DOM 注册的引用
		else {
			removeDOMRegister(vm, fragment);
		}
	}

	/**
	 * 获取节点的下一个兄弟元素节点
	 */
	up.getSibling = function(node) {
		var el = node.nextSibling;
		var isElementNode = this.vm.isElementNode;

		if (el && isElementNode(el)) {
			return el;
		}

		while (el) {
			el = el.nextSibling;

			if (el && isElementNode(el)) {
				return el;
			}
		}

		return null;
	}

	/**
	 * 更新节点的 attribute realize v-bind
	 * @param   {DOMElement}  node
	 * @param   {String}      attribute
	 * @param   {String}      value
	 */
	up.updateAttribute = function(node, attribute, value) {
		// null 则移除该属性
		if (value === null) {
			dom.removeAttr.apply(this, arguments);
		}
		// setAttribute 不适合用于 value
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
		else if (attribute === 'value') {
			node.value = value;
		}
		else {
			dom.setAttr(node, attribute, value);
		}
	}

	/**
	 * 更新节点的 classname realize v-bind:class
	 * @param   {DOMElement}          node
	 * @param   {String|Boolean}      newclass
	 * @param   {String|Boolean}      oldclass
	 * @param   {String}              classname
	 */
	up.updateClassName = function(node, newclass, oldclass, classname) {
		// 指定 classname 变化值由 newclass 布尔值决定
		if (classname) {
			if (newclass === true) {
				dom.addClass(node, classname);
			}
			else if (newclass === false) {
				dom.removeClass(node, classname);
			}
		}
		// 未指定 classname 变化值由 newclass 的值决定
		else {
			if (newclass) {
				dom.addClass(node, newclass);
			}

			if (oldclass) {
				dom.removeClass(node, oldclass);
			}
		}
	}

	/**
	 * 更新节点的 style realize v-bind:style
	 * @param   {DOMElement}  node
	 * @param   {String}      property  [属性名称]
	 * @param   {String}      value     [样式值]
	 */
	up.updateStyle = function(node, property, value) {
		if (node.style[property] !== value) {
			node.style[property] = value;
		}
	}

	/**
	 * 更新节点绑定事件的回调函数 realize v-on
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 * @param   {Boolean}      unbind
	 */
	up.updateEvent = function(node, evt, callback, capture, unbind) {
		// 移除绑定
		if (unbind) {
			eventer.remove(node, evt, callback, capture);
		}
		else {
			eventer.add(node, evt, callback, capture);
		}
	}

	/**
	 * 更新 text 或 textarea 的 value realize v-model
	 * @param   {Input}  text
	 * @param   {String} value
	 */
	up.updateTextValue = function(text, value) {
		if (text.value !== value) {
			text.value = value;
		}
	}

	/**
	 * 更新 radio 的激活状态 realize v-model
	 * @param   {Input}  radio
	 * @param   {String} value
	 */
	up.updateRadioChecked = function(radio, value) {
		radio.checked = radio.value === (util.isNumber(value) ? String(value) : value);
	}

	/**
	 * 更新 checkbox 的激活状态 realize v-model
	 * @param   {Input}          checkbox
	 * @param   {Array|Boolean}  values      [激活数组或状态]
	 */
	up.updateCheckboxChecked = function(checkbox, values) {
		var value = checkbox.value;

		if (!util.isArray(values) && !util.isBool(values)) {
			return util.warn('checkbox v-model value must be a type of Boolean or Array!');
		}

		if (dom.hasAttr(checkbox, 'number')) {
			value = +value;
		}

		checkbox.checked = util.isBool(values) ? values : (values.indexOf(value) !== -1);
	}

	/**
	 * 更新 select 的激活状态 realize v-model
	 * @param   {Select}         select
	 * @param   {Array|String}   selected  [选中值]
	 * @param   {Boolean}        multi
	 */
	up.updateSelectChecked = function(select, selected, multi) {
		var getNumber = dom.hasAttr(select, 'number');
		var options = select.options, leng = options.length;
		var multiple = multi || dom.hasAttr(select, 'multiple');

		for (var i = 0; i < leng; i++) {
			var option = options[i];
			var value = option.value;
			value = getNumber ? +value : (dom.hasAttr(option, 'number') ? +value : value);
			option.selected = multiple ? selected.indexOf(value) !== -1 : selected === value;
		}
	}

	/**
	 * observer 数据变化监测模块
	 * @param  {Object}     object    [VM 数据模型]
	 * @param  {Function}   callback  [变化回调函数]
	 * @param  {Object}     context   [执行上下文]
	 * @param  {Object}     args      [<可选>回调额外参数]
	 */
	function Observer(object, callback, context, args) {
		if (util.isString(callback)) {
			callback = context[callback];
		}

		this.$args = args;
		this.$context = context;
		this.$callback = callback;

		// 子对象字段，子对象的内部变更只触发顶层字段
		this.$subPaths = [];

		// 当前数组操作
		this.$action = 921;
		// 重写的 Array 方法
		this.$methods = 'push|pop|shift|unshift|splice|sort|reverse'.split('|');

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
			this.rewriteMethods(object, paths);
		}

		util.each(object, function(value, property) {
			var copies = paths && paths.slice(0);
			if (copies) {
				copies.push(property);
			}
			else {
				copies = [property];
			}

			this.bindWatch(object, copies, value);
		}, this);

		return this;
	}

	/**
	 * 拦截对象属性存取描述符（绑定监测）
	 * @param   {Object|Array}  object  [对象或数组]
	 * @param   {Array}         paths   [访问路径数组]
	 */
	op.bindWatch = function(object, paths, val) {
		var path = paths.join('*');
		var prop = paths[paths.length - 1];
		var descriptor = Object.getOwnPropertyDescriptor(object, prop);
		var getter = descriptor.get, setter = descriptor.set;

		// 定义 object[prop] 的 getter 和 setter
		Object.defineProperty(object, prop, {
			get: (function Getter() {
				return getter ? getter.call(object) : val;
			}).bind(this),

			set: (function Setter(newValue, noTrigger) {
				var subPath, oldObjectVal, args;
				var oldValue = getter ? getter.call(object) : val;
				var isArrayAction = this.$methods.indexOf(this.$action) !== -1;

				if (newValue === oldValue) {
					return;
				}

				if (
					!isArrayAction &&
					(util.isArray(newValue) || util.isObject(newValue))
				) {
					this.observe(newValue, paths);
				}

				// 获取子对象路径
				subPath = this.getSubPath(path);
				if (subPath) {
					oldObjectVal = object[prop];
				}

				if (setter) {
					setter.call(object, newValue, true);
				}
				else {
					val = newValue;
				}

				if (isArrayAction || noTrigger) {
					return;
				}

				args = subPath ? [subPath, object[prop], oldObjectVal] : [path, newValue, oldValue];
				this.trigger.apply(this, args);
			}).bind(this)
		});

		var value = object[prop];
		var isObject = util.isObject(value);

		// 嵌套数组或对象
		if (util.isArray(value) || isObject) {
			this.observe(value, paths);
		}

		// 缓存子对象字段
		if (
			isObject &&
			this.$subPaths.indexOf(path) === -1 &&
			!util.isNumber(+path.split('*').pop())
		) {
			this.$subPaths.push(path);
		}
	}

	/**
	 * 是否是子对象路径，如果是则返回对象路径
	 * @param   {String}   path
	 * @return  {String}
	 */
	op.getSubPath = function(path) {
		var paths = this.$subPaths;
		for (var i = 0; i < paths.length; i++) {
			if (path.indexOf(paths[i]) === 0) {
				return paths[i];
			}
		}
	}

	/**
	 * 重写指定的 Array 方法
	 * @param   {Array}  array  [目标数组]
	 * @param   {Array}  paths  [访问路径数组]
	 */
	op.rewriteMethods = function(array, paths) {
		var arrayProto = Array.prototype;
		var arrayMethods = Object.create(arrayProto);
		var path = paths && paths.join('*');

		util.each(this.$methods, function(method) {
			var self = this, original = arrayProto[method];
			util.defRec(arrayMethods, method, function _redefineArrayMethod() {
				var arguments$1 = arguments;

				var i = arguments.length, result;
				var args = new Array(i);

				while (i--) {
					args[i] = arguments$1[i];
				}

				self.$action = method;

				result = original.apply(this, args);

				self.$action = 921;

				// 重新监测
				self.observe(this, paths);

				// 触发回调
				self.trigger(path, this, method, args);

				return result;
			});
		}, this);

		// 添加 $set 方法，提供需要修改的数组项下标 index 和新值 value
		util.defRec(arrayMethods, '$set', function $set(index, value) {
			// 超出数组长度默认在最后添加（相当于 push）
			if (index >= this.length) {
				index = this.length;
			}

			return this.splice(index, 1, value)[0];
		});

		// 添加 $remove 方法
		util.defRec(arrayMethods, '$remove', function $remove(item) {
			var index = this.indexOf(item);

			if (index !== -1) {
				return this.splice(index, 1);
			}
		});

		array.__proto__ = arrayMethods;
	}

	/**
	 * 触发 object 变化回调
	 * @param   {String}       path      [变更路径]
	 * @param   {Mix}          last      [新值]
	 * @param   {Mix|String}   old       [旧值，数组操作时为操作名称]
	 * @param   {Array}        args      [数组操作时的参数]
	 */
	op.trigger = function(path, last, old, args) {
		this.$callback.apply(this.$context, [path, last, old, args || this.$args]);
	}

	/**
	 * 销毁函数
	 */
	op.destroy = function() {
		this.$args = this.$context = this.$callback = this.$subPaths = this.$action = this.$methods = null;
	}

	/**
	 * watcher 数据订阅模块
	 */
	function Watcher(model) {
		this.$model = model;

		// 数据模型订阅集合
		this.$modelSubs = {};

		// 访问路径订阅集合
		this.$accessSubs = {};

		// 数组下标订阅集合
		this.$indexSubs = {};

		// 深层订阅集合
		this.$deepSubs = {};

		this.observer = new Observer(model, 'change', this);
	}

	var wp = Watcher.prototype;

	/**
	 * 变化触发回调
	 * @param   {String}  path
	 * @param   {Mix}     last
	 * @param   {Mix}     old
	 * @param   {Array}   args
	 */
	wp.change = function(path, last, old, args) {
		var isAccess = path.indexOf('*') !== -1;
		var subs = isAccess ? this.$accessSubs[path] : this.$modelSubs[path];
		this.trigger(subs, path, last, old, args);

		if (isAccess) {
			var field = path.split('*').shift();
			this.trigger(this.$deepSubs[field], path, last, old, args);
		}
	}

	/**
	 * 触发订阅的所有回调
	 * @param   {Array}   subs
	 * @param   {String}  path
	 * @param   {Mix}     last
	 * @param   {Mix}     old
	 * @param   {Array}   args
	 */
	wp.trigger = function(subs, path, last, old, args) {
		util.each(subs, function(sub) {
			sub.cb.call(sub.ct, path, last, old, args || sub.arg);
		});
	}

	/**
	 * 订阅一个依赖集合的变化回调 (顶层模型 access 为 undefined)
	 * @param   {Object}    depends
	 * @param   {Function}  callback
	 * @param   {Object}    context
	 * @param   {Array}     args
	 */
	wp.watch = function(depends, callback, context, args) {
		// 依赖的数据模型
		var depModels = depends.dep;
		// 依赖的访问路径
		var depAccess = depends.acc;

		util.each(depModels, function(model, index) {
			var access = depAccess[index];

			// 暂时只有这一个需要忽略的关键字
			if (model === '$event') {
				return;
			}

			// 下标取值
			if (model.indexOf('$index') !== -1) {
				this.watchIndex(access, callback, context, args);
				return;
			}

			// 嵌套数组/对象
			if (access) {
				this.watchAccess(access, callback, context, args);
				return;
			}

			// 顶层数据模型
			this.watchModel(util.getExpAlias(model), callback, context, args);

		}, this);
	}

	/**
	 * 订阅一个数据模型字段的变化回调
	 * @param  {String}    field
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 * @param  {Array}     args
	 * @param  {Boolean}   deep
	 */
	wp.watchModel = function(field, callback, context, args, deep) {
		if (!util.hasOwn(this.$model, field)) {
			return util.warn('The field: "' + field + '" does not exist in model!');
		}

		if (field.indexOf('*') !== -1) {
			return util.warn('Model key cannot contain the character "*"!');
		}

		this.addSubs(this.$modelSubs, field, callback, context, args);

		// index.js watch api 调用，用于数组的深层监测
		if (deep) {
			this.addSubs(this.$deepSubs, field, callback, context, args);
		}
	}

	/**
	 * 订阅多层访问路径变化回调
	 * @param  {String}    access
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 * @param  {Array}     args
	 */
	wp.watchAccess = function(access, callback, context, args) {
		this.addSubs(this.$accessSubs, access, callback, context, args);
	}

	/**
	 * 订阅 vfor 数组下标变化回调
	 * @param  {String}    access
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 * @param  {Array}     args
	 */
	wp.watchIndex = function(access, callback, context, args) {
		this.addSubs(this.$indexSubs, access, callback, context, args);
	}

	/**
	 * 缓存订阅回调
	 */
	wp.addSubs = function(subs, identifier, callback, context, args) {
		// 缓存回调函数
		if (!subs[identifier]) {
			subs[identifier] = [];
		}

		subs[identifier].push({
			'cb' : callback,
			'ct' : context,
			'arg': args
		});
	}

	/**
	 * 移除指定的访问路径/下标订阅(重新编译 vfor)
	 */
	wp.removeSubs = function(field) {
		// 下标
		util.each(this.$indexSubs, function(sub, index) {
			if (index.indexOf(field) === 0) {
				return null;
			}
		});
		// 访问路径
		util.each(this.$accessSubs, function(sub, access) {
			if (access.indexOf(field) === 0) {
				return null;
			}
		});
	}

	/**
	 * 发生数组操作时处理订阅的移位
	 * @param   {String}  field     [数组字段]
	 * @param   {String}  moveMap   [移位的映射关系]
	 */
	wp.moveSubs = function(field, moveMap, method) {
		// 数组字段标识
		var prefix = field + '*';
		// 移位下标
		this.moveIndex(prefix, moveMap);
		// 移位访问路径
		this.moveAccess(prefix, moveMap);
	}

	/**
	 * 移位下标订阅集合
	 * 移位的过程需要触发所有回调以更改每一个 $index
	 */
	wp.moveIndex = function(prefix, moveMap) {
		var dest = {};
		var subs = this.$indexSubs;
		var caches = util.copy(subs);

		// 根据结果映射 移位下标
		util.each(moveMap, function(move, index) {
			var udf;
			var nowIndex = prefix + index;
			var moveIndex = prefix + move;

			dest[nowIndex] = caches[moveIndex];

			// 被挤掉的设为 undefined
			if (move === udf) {
				subs[nowIndex] = udf;
			}
		});

		// 触发 $index 变更
		util.each(dest, function(subs, index) {
			var i = +index.substr(prefix.length);
			util.each(subs, function(sub) {
				sub.cb.call(sub.ct, '$index', i, sub.arg);
			});
		});

		// 合并移位结果
		util.extend(subs, dest);

		dest = caches = null;
	}

	/**
	 * 移位访问路径订阅集合
	 * 移位的过程不需要触发回调
	 */
	wp.moveAccess = function(prefix, moveMap) {
		var dest = {};
		var subs = this.$accessSubs;
		var caches = util.copy(subs);

		// 根据结果映射 移位访问路径
		util.each(moveMap, function(move, index) {
			var udf;
			var befores = [], afters = [];
			var nowIndex = prefix + index;
			var moveIndex = prefix + move;

			// 提取出替换前后的访问路径集合
			util.each(subs, function(sub, access) {
				if (move === udf && access.indexOf(nowIndex) === 0) {
					afters.push(udf);
					befores.push(access);
				}
				else if (access.indexOf(moveIndex) === 0) {
					afters.push(access);
					befores.push(access.replace(moveIndex, nowIndex));
				}
			});

			// 进行替换
			util.each(befores, function(before, index) {
				var after = afters[index];

				// 被挤掉的设为 undefined
				if (after === udf) {
					subs[before] = udf;
				}
				else {
					dest[before] = caches[after];
				}
			});
		});

		// 合并移位结果
		util.extend(subs, dest);

		dest = caches = null;
	}

	/**
	 * 销毁函数
	 */
	wp.destroy = function() {
		util.clear(this.$modelSubs);
		util.clear(this.$accessSubs);
		util.clear(this.$indexSubs);
		util.clear(this.$deepSubs);
		this.observer.destroy();
	}

	// 表达式中允许的关键字
	var allowKeywords = 'Math.parseInt.parseFloat.Date.this.true.false.null.undefined.Infinity.NaN.isNaN.isFinite.decodeURI.decodeURIComponent.encodeURI.encodeURIComponent';
	var regAllowKeyword = new RegExp('^(' + allowKeywords.replace(/\./g, '\\b|') + '\\b)');

	// 表达式中禁止的关键字
	var avoidKeywords = 'var.const.let.if.else.for.in.continue.switch.case.break.default.function.return.do.while.delete.try.catch.throw.finally.with.import.export.instanceof.yield.await';
	var regAviodKeyword = new RegExp('^(' + avoidKeywords.replace(/\./g, '\\b|') + '\\b)');

	// 匹配常量缓存序号 "1"
	var regSaveConst = /"(\d+)"/g;
	// 只含有 true 或 false
	var regBool = /^(true|false)$/;
	// 匹配表达式中的常量
	var regReplaceConst = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|typeof /g;
	// 匹配表达式中的取值域
	var regReplaceScope = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g;
	// 匹配常规取值: item or item['x'] or item["y"] or item[0]
	var regNormal = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;

	/**
	 * 是否是常规指令表达式
	 * @param   {String}   expression
	 * @return  {Boolean}
	 */
	function isNormal(expression) {
		return regNormal.test(expression) && !regBool.test(expression) && expression.indexOf('Math.') !== 0;
	}

	// 保存常量，返回序号 "i"
	var consts = [];
	function saveConst(string) {
		var i = consts.length;
		consts[i] = string;
		return '"' + i + '"';
	}

	/**
	 * 返回替换之前的常量
	 * @param   {Strinf}  string
	 * @param   {Number}  i
	 * @return  {String}
	 */
	function returnConst(string, i) {
		return consts[i];
	}

	/**
	 * 返回表达式的 scope 替换
	 * @param   {String}  string
	 * @return  {String}
	 */
	function replaceScope(string) {
		var pad = string.charAt(0);
		var path = string.slice(1);

		if (regAllowKeyword.test(path)) {
			return string;
		}
		else {
			path = path.indexOf('"') !== -1 ? path.replace(regSaveConst, returnConst) : path;
			return pad + 'scope.' + path;
		}
	}

	/**
	 * 获取取值表达式的 vfor 取值域别名
	 * @param   {Object}  fors         <必选>
	 * @param   {String}  expression   <必选>
	 * @return  {String}
	 */
	function getAlias(fors, expression) {
		var alias, exp = expression;

		if (exp.indexOf(fors.alias) !== -1) {
			return fors.alias;
		}

		// 跨层级的别名
		util.each(fors.aliases, function(_alias) {
			if ((new RegExp('\\b' + _alias + '\\b|\\b'+ _alias +'\\.')).test(exp)) {
				alias = _alias;
				return false;
			}
		});

		return alias;
	}


	/**
	 * Parser 基础解析器模块，指令解析模块都继承于 Parser
	 */
	function Parser() {}
	var p = Parser.prototype;

	/**
	 * 绑定监测 & 初始化视图
	 * @param   {Object}      fors
	 * @param   {DOMElement}  node
	 * @param   {String}      expression
	 */
	p.bind = function(fors, node, expression) {
		// 提取依赖
		var deps = this.getDeps(fors, expression);
		// 取值域
		var scope = this.getScope(fors, expression);
		// 取值函数
		var getter = this.getEval(fors, expression);
		// 别名映射
		var maps = fors && util.copy(fors.maps);

		// 初始视图更新
		this.update(node, getter.call(scope, scope));

		// 监测依赖变化，更新取值 & 视图
		this.vm.watcher.watch(deps, function() {
			scope = this.updateScope(scope, maps, deps, arguments);
			this.update(node, getter.call(scope, scope));
		}, this);
	}

	/**
	 * 生成表达式取值函数
	 * @param   {String}    expression
	 * @return  {Function}
	 */
	p.createGetter = function(expression) {
		try {
			return new Function('scope', 'return ' + expression + ';');
		}
		catch (e) {
			throw('Invalid generated expression: ' + expression);
		}
	}

	/**
	 * 获取表达式的取值函数
	 */
	p.getEval = function(fors, expression) {
		var exp = this.toScope(expression);

		if (regAviodKeyword.test(exp)) {
			return util.warn('Avoid using unallow keyword in expression: ' + exp);
		}

		// 替换 vfor 取值域别名
		if (fors) {
			util.each(fors.aliases, function(alias) {
				var reg = new RegExp('scope.' + alias, 'g');
				exp = exp.replace(reg, function(scope) {
					return 'scope.$' + scope;
				});
			});
		}

		return this.createGetter(exp);
	}

	/**
	 * 转换表达式的变量为 scope 关键字参数
	 * @return  {String}
	 */
	p.toScope = function(expression) {
		var exp = expression;

		if (isNormal(exp)) {
			return 'scope.' + exp;
		}

		exp = (' ' + exp).replace(regReplaceConst, saveConst);
		exp = exp.replace(regReplaceScope, replaceScope);
		exp = exp.replace(regSaveConst, returnConst);

		return exp;
	}

	/**
	 * 获取数据模型
	 * @return  {Object}
	 */
	p.getModel = function() {
		return this.vm.$data;
	}

	/**
	 * 获取表达式的取值域
	 * @param   {Object}  fors
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	p.getScope = function(fors, expression) {
		var model = this.getModel();

		if (fors) {
			util.defRec(model, '$index', fors.index);
			util.defRec(model, '$scope', fors.scopes);
		}

		return model;
	}

	/**
	 * 更新取值域
	 * @param   {Object}  oldScope   [旧取值域]
	 * @param   {Object}  maps       [别名映射]
	 * @param   {Object}  deps       [取值依赖]
	 * @param   {Array}   args       [变更参数]
	 * @return  {Mix}
	 */
	p.updateScope = function(oldScope, maps, deps, args) {
		var leng = 0, $scope = {};
		var model = this.getModel();
		var targetPaths, scopePaths;
		var accesses = util.copy(deps.acc);

		// 获取最深层的依赖
		accesses.unshift(args[0]);
		util.each(accesses, function(access) {
			var paths = util.makePaths(access);
			if (paths.length > leng) {
				targetPaths = paths;
				leng = paths.length;
			}
		});

		// 更新 vfor 取值
		if (targetPaths) {
			// 取值路径数组
			scopePaths = util.makeScopePaths(targetPaths);
			// 对每一个取值路径进行更新
			util.each(scopePaths, function(paths) {
				var leng = paths.length;

				// 更新下标的情况通过变更参数来确定
				if ((args[0] === '$index')) {
					paths[leng - 1] = args[1];
				}

				var field = paths[leng - 2];
				var index = +paths[leng - 1];
				var scope = util.getDeepValue(model, paths) || {};

				util.defRec(model, '$index', index);
				$scope[maps[field]] = scope;
			});

			util.defRec(model, '$scope', util.extend(oldScope.$scope, $scope));
		}

		return model;
	}

	/**
	 * 获取表达式的所有依赖（取值模型+访问路径）
	 * @param   {Object}  fors        [vfor 数据]
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	p.getDeps = function(fors, expression) {
		var deps = [], paths = [];
		var exp = ' ' + expression.replace(regReplaceConst, saveConst);
		var depMatches = exp.match(regReplaceScope);

		// 提取依赖和依赖的访问路径
		util.each(depMatches, function(dep) {
			var model = dep.substr(1);
			var alias, hasIndex, access, valAccess;

			// 取值域别名或 items.length -> items
			if (fors) {
				alias = getAlias(fors, dep);
				hasIndex = model.indexOf('$index') !== -1;

				// 取值域路径
				if (model.indexOf(alias) !== -1 || hasIndex) {
					access = fors.accesses[fors.aliases.indexOf(alias)];
				}
			}
			else {
				alias = util.getExpAlias(model);
			}

			// 取值字段访问路径，输出别名和下标
			if (hasIndex || model === alias) {
				valAccess = access || fors && fors.access;
			}
			else {
				if (access && model !== '$event') {
					valAccess = access + '*' + util.getExpKey(model);
				}
			}

			// 相同的依赖出现多次只需记录一次
			if (deps.indexOf(model) === -1) {
				deps.push(model);
				paths.push(valAccess);
			}
		});

		return {
			'dep': deps,
			'acc': paths
		}
	}

	/**
	 * 分解字符串函数参数
	 * @param   {String}  funcString
	 * @return  {Object}
	 */
	function stringToParams(funcString) {
		var args, func;
		var exp = util.removeSpace(funcString);
		var matches = exp.match(/(\(.*\))/);
		var result = matches && matches[0];

		// 有函数名和参数
		if (result) {
			func = exp.substr(0, exp.indexOf(result));
			args = '[' + result.substr(1, result.length - 2) + ']';
		}
		// 只有函数名
		else {
			func = exp;
		}

		return {
			'func': func,
			'args': args
		}
	}

	/**
	 * 字符 json 转为键值对象
	 * @param   {String}  jsonString
	 * @return  {Object}
	 */
	function convertJson(jsonString) {
		var json, string = jsonString.trim();

		if (/^\{.*\}$/.test(string)) {
			json = {};
			var leng = string.length;
			string = string.substr(1, leng - 2).replace(/\s/g, '');
			var props = string.match(/[^,]+:[^:]+((?=,[^:]+:)|$)/g);

			util.each(props, function(prop) {
				var vals = util.getKeyValue(prop, true);
				var name = vals[0], value = vals[1];
				if (name && value) {
					name = name.replace(/(^'*)|('*$)|(^"*)|("*$)/g, '');
					json[name] = value;
				}
			});
		}

		return json;
	}


	/**
	 * v-on 指令解析模块
	 */
	function Von(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var von = Von.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-on 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 * @param   {String}      directive   [指令名称]
	 */
	von.parse = function(fors, node, expression, directive) {
		// 单个事件
		if (directive.indexOf(':') !== -1) {
			this.parseSingle.apply(this, arguments);
		}
		// 多个事件
		else {
			this.parseJson.apply(this, arguments);
		}
	}

	/**
	 * 解析单个 v-on:type
	 */
	von.parseSingle = function(fors, node, expression, directive) {
		// 事件信息
		var info = stringToParams(expression);
		// 事件类型
		var type = util.getKeyValue(directive);
		// 事件取值字段名称
		var field = info.func;
		// 参数字符串
		var paramString = info.args;

		// 获取事件函数
		var deps = this.getDeps(fors, field);
		var scope = this.getScope(fors, field);
		var getter = this.getEval(fors, field);
		var func = getter.call(scope, scope);

		// 绑定事件 & 参数求值
		this.bindEvent(fors, node, field, type, func, paramString);

		// 监测依赖变化，绑定新回调，旧回调将被移除
		this.vm.watcher.watch(deps, function(path, lastCallback, oldCallback) {
			// 解除绑定
			this.update(node, type, oldCallback, false, true);
			// 绑定新回调
			this.bindEvent(fors, node, path, type, lastCallback, paramString);
		}, this);
	}

	/**
	 * 解析多个 v-on=eventJson
	 */
	von.parseJson = function(fors, node, expression) {
		util.each(convertJson(expression), function(exp, type) {
			this.parseSingle(fors, node, exp, type);
		}, this);
	}

	/**
	 * 绑定一个事件
	 * @param   {Object}      fors
	 * @param   {DOMElement}  node
	 * @param   {String}      field
	 * @param   {String}      evt
	 * @param   {Function}    func
	 * @param   {String}      paramString
	 */
	von.bindEvent = function(fors, node, field, evt, func, paramString) {
		var self, stop, prevent, keyCode, capture = false;

		if (!util.isFunc(func)) {
			return;
		}

		// 支持 4 种事件修饰符 .self .stop .prevent .capture
		if (evt.indexOf('.') !== -1) {
			var modals = evt.split('.');
			evt = modals.shift();
			self = modals && modals.indexOf('self') !== -1;
			stop = modals && modals.indexOf('stop') !== -1;
			prevent = modals && modals.indexOf('prevent') !== -1;
			capture = modals && modals.indexOf('capture') !== -1;
			keyCode = evt.indexOf('key') === 0 ? +modals[0] : null;
		}

		// 处理回调参数以及依赖监测
		var args = [];
		if (paramString) {
			// 取值依赖
			var deps = this.getDeps(fors, paramString);
			// 别名映射
			var maps = fors && util.copy(fors.maps);
			// 取值域
			var scope = this.getScope(fors, paramString);
			// 添加别名标记
			util.defRec(scope, '$event', '$event');
			// 取值函数
			var getter = this.getEval(fors, paramString);
			// 事件参数
			args = getter.call(scope, scope);

			this.vm.watcher.watch(deps, function() {
				scope = this.updateScope(scope, maps, deps, arguments);
				args = getter.call(scope, scope);
			}, this);
		}

		// 事件代理函数
		var eventProxy = function _eventProxy(e) {
			// 是否限定只能在当前节点触发事件
			if (self && e.target !== node) {
				return;
			}

			// 是否指定按键触发
			if (keyCode && keyCode !== e.keyCode) {
				return;
			}

			// 未指定参数，则原生事件对象作为唯一参数
			if (!args.length) {
				args.push(e);
			}
			else {
				// 更新/替换事件对象
				util.each(args, function(param, index) {
					if (param === '$event' || param instanceof Event) {
						args[index] = e;
					}
				});
			}

			// 是否阻止冒泡
			if (stop) {
				e.stopPropagation();
			}

			// 是否阻止默认事件
			if (prevent) {
				e.preventDefault();
			}

			func.apply(this, args);
		}

		// 添加绑定
		this.update(node, evt, eventProxy, capture);
	}

	/**
	 * 更新绑定事件
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	von.update = function() {
		var updater = this.vm.updater;
		updater.updateEvent.apply(updater, arguments);
	}

	/**
	 * v-el 指令解析模块
	 */
	function Vel(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vel = Vel.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-el 指令 (不需要在 model 中声明)
	 * @param   {Object}      fors    [vfor 数据]
	 * @param   {DOMElement}  node    [注册节点]
	 * @param   {String}      value   [注册字段]
	 */
	vel.parse = function(fors, node, value) {
		if (fors) {
			var alias = util.getExpAlias(value);

			// vel 在 vfor 循环中只能在当前循环体中赋值
			if (alias !== fors.alias) {
				return util.warn('when v-el use in v-for must be defined inside current loop body!');
			}

			var scope = fors.scopes[alias];

			if (util.isObject(scope)) {
				var key = util.getExpKey(value);
				scope[key] = node;
			}
		}
		else {
			this.vm.$data.$els[value] = node;
		}
	}

	/**
	 * v-if 指令解析模块
	 */
	function Vif(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vif = Vif.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-if 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vif.parse = function() {
		this.bind.apply(this, arguments);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}   node
	 * @param   {Boolean}      isRender
	 */
	vif.update = function() {
		var updater = this.vm.updater;
		updater.updateRenderContent.apply(updater, arguments);
	}

	/**
	 * v-for 指令解析模块
	 */
	function Vfor(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vfor = Vfor.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-for 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vfor.parse = function(fors, node, expression) {
		var vm = this.vm;
		var match = expression.match(/(.*) in (.*)/);
		var alias = match[1];
		var iterator = match[2];

		var watcher = vm.watcher;
		var parent = node.parentNode;
		var isOption = node.tagName === 'OPTION' && parent.tagName === 'SELECT';

		// 取值信息
		var scope = this.getScope(fors, iterator);
		var getter = this.getEval(fors, iterator);
		var array = getter.call(scope, scope);

		// 循环数组的访问路径
		var loopAccess = iterator;
		var listArgs, template, updates;
		var key = util.getExpKey(iterator);

		// 循环层级
		var level = -1;
		// 取值域集合
		var scopes = {};
		// 取值域与数组字段映射
		var maps = {};
		// 别名集合
		var aliases = [];
		// 取值域路径集合
		var accesses = [];

		// 嵌套 vfor
		if (fors) {
			maps = fors.maps;
			level = fors.level;
			scopes = fors.scopes;
			aliases = fors.aliases.slice(0);
			accesses = fors.accesses.slice(0);
			loopAccess = fors.access + '*' + key;
		}

		if (!util.isArray(array)) {
			parent.removeChild(node);
			return;
		}

		listArgs = [node, array, 0, loopAccess, alias, aliases, accesses, scopes, maps, ++level];
		template = this.buildList.apply(this, listArgs);

		node.parentNode.replaceChild(template, node);

		if (isOption) {
			this.updateOption(parent, fors);
		}

		// 数组更新信息
		updates = {
			'alias'   : alias,
			'aliases' : aliases,
			'access'  : loopAccess,
			'accesses': accesses,
			'scopes'  : scopes,
			'level'   : level,
			'maps'    : maps
		}

		// 监测根数组的数组操作
		if (!fors) {
			watcher.watchModel(loopAccess, function(path, last, method, args) {
				this.update(parent, node, last, method, updates, args);
			}, this);
		}
		// 监测嵌套数组的操作
		else {
			watcher.watchAccess(loopAccess, function(path, last, method, args) {
				this.update(parent, node, last, method, updates, args);
			}, this);
		}
	}

	/**
	 * 更新 select/option 在 vfor 中的值
	 * @param   {Select}  select
	 * @param   {Object}  fors
	 */
	vfor.updateOption = function(select, fors) {
		var model = select._vmodel;
		var getter = this.getEval(fors, model);
		var scope = this.getScope(fors, model);
		var value = getter.call(scope, scope);
		this.vm.updater.updateSelectChecked(select, value);
	}

	/**
	 * 根据源数组构建循环板块集合
	 * @param   {DOMElement}  node      [循环模板]
	 * @param   {Array}       array     [取值数组]
	 * @param   {Number}      start     [开始的下标计数]
	 * @param   {String}      paths     [取值数组访问路径]
	 * @param   {String}      alias     [当前取值域别名]
	 * @param   {Array}       aliases   [取值域别名数组]
	 * @param   {Array}       accesses  [取值域访问路径数组]
	 * @param   {Object}      scopes    [取值域集合]
	 * @param   {Object}      maps      [数组与取值域的映射]
	 * @param   {Number}      level     [当前循环层级]
	 * @return  {Fragment}              [板块文档碎片集合]
	 */
	vfor.buildList = function(node, array, start, paths, alias, aliases, accesses, scopes, maps, level) {
		var vm = this.vm;
		var fragments = util.createFragment();

		util.each(array, function(scope, i) {
			var index = start + i;
			var field = paths.split('*').pop();
			var cloneNode = node.cloneNode(true);
			var fors, access = paths + '*' + index;

			scopes[alias] = scope;
			aliases[level] = alias;
			accesses[level] = access;
			maps[field] = alias;

			fors = {
				// 别名
				'alias'   : alias,
				// 别名集合
				'aliases' : aliases,
				// 取值域访问路径
				'access'  : access,
				// 取值域访问路径集合
				'accesses': accesses,
				// 取值域集合
				'scopes'  : scopes,
				// 数组取值域映射
				'maps'    : maps,
				// 当前循环层级
				'level'   : level,
				// 当前取值域下标
				'index'   : index
			}

			// 阻止重复编译除 vfor 以外的指令
			if (node._vfor_directives > 1) {
				vm.blockCompile(node);
			}

			this.signAlias(cloneNode, alias);

			// 传入 vfor 数据编译板块
			vm.complieElement(cloneNode, true, fors);

			fragments.appendChild(cloneNode);
		}, this);

		return fragments;
	}

	/**
	 * 标记节点的 vfor 别名
	 * @param   {DOMElement}  node
	 * @param   {String}      alias
	 */
	vfor.signAlias = function(node, alias) {
		util.def(node, '_vfor_alias', alias);
	}

	/**
	 * 数组操作更新 vfor 循环列表
	 * @param   {DOMElement}  parent    [父节点]
	 * @param   {DOMElement}  node      [初始模板片段]
	 * @param   {Array}       newArray  [新的数据重复列表]
	 * @param   {String}      method    [数组操作]
	 * @param   {Array}       updates   [更新信息]
	 * @param   {Array}       args      [数组操作参数]
	 */
	vfor.update = function(parent, node, newArray, method, updates, args) {
		switch (method) {
			case 'push':
				this.push.apply(this, arguments);
				break;
			case 'pop':
				this.pop.apply(this, arguments);
				break;
			case 'unshift':
				this.unshift.apply(this, arguments);
				break;
			case 'shift':
				this.shift.apply(this, arguments);
				break;
			case 'splice':
				this.splice.apply(this, arguments);
				break;
			// sort、reverse 操作或直接赋值都重新编译
			default: this.recompile.apply(this, arguments);
		}
	}

	/**
	 * 更新数组操作的取值域
	 * @param   {Object}  update
	 * @return  {Object}
	 */
	vfor.updateScopes = function(update) {
		var scopes = update.scopes;
		var accesses = update.accesses;
		var aleng = accesses.length;

		// 更新嵌套数组的取值域
		if (aleng > 1) {
			var maps = update.maps;
			var model = this.vm.$data;
			var targetPaths = util.makePaths(accesses[aleng - 1]);
			// 对每一个取值域进行更新
			util.each(util.makeScopePaths(targetPaths), function(paths) {
				var index = paths.length - 2;
				var alias = maps[paths[index]];
				var scope = util.getDeepValue(model, paths) || {};
				scopes[alias] = scope;
			});
		}

		return scopes;
	}

	/**
	 * 获取 shift 或 unshift 操作对应列表下标变化的关系
	 * @param   {String}  method  [数组操作]
	 * @param   {Number}  length  [新数组长度]
	 * @return  {Object}          [新数组下标的变化映射]
	 */
	vfor.getChanges = function(method, length) {
		var i, udf, map = {};

		switch (method) {
			case 'unshift':
				map[0] = udf;
				for (i = 1; i < length; i++) {
					map[i] = i - 1;
				}
				break;
			case 'shift':
				for (i = 0; i < length + 1; i++) {
					map[i] = i + 1;
				}
				map[length] = udf;
				break;
		}

		return map;
	}

	/**
	 * 在循环体的最后追加一条数据 array.push
	 */
	vfor.push = function(parent, node, newArray, method, up) {
		var last = newArray.length - 1;
		var alias = up.alias;
		var list = [newArray[last]];
		var scopes = this.updateScopes(up);
		var listArgs = [node, list, last, up.access, alias, up.aliases, up.accesses, scopes, up.maps, up.level];
		var lastChild = this.getLast(parent, alias);
		var template = this.buildList.apply(this, listArgs);

		// empty list
		if (!lastChild) {
			parent.appendChild(template);
		}
		else {
			parent.insertBefore(template, lastChild.nextSibling);
		}
	}

	/**
	 * 移除循环体的最后一条数据 array.pop
	 */
	vfor.pop = function(parent, node, newArray, method, updates) {
		var lastChild = this.getLast(parent, updates.alias);
		if (lastChild) {
			parent.removeChild(lastChild);
		}
	}

	/**
	 * 在循环体最前面追加一条数据 array.unshift
	 */
	vfor.unshift = function(parent, node, newArray, method, up) {
		var alias = up.alias;
		var list = [newArray[0]];
		var map, template, firstChild;
		var scopes = this.updateScopes(up);
		var listArgs = [node, list, 0, up.access, alias, up.aliases, up.accesses, scopes, up.maps, up.level];

		// 移位相关的订阅回调
		map = this.getChanges(method, newArray.length);
		this.vm.watcher.moveSubs(up.access, map);

		template = this.buildList.apply(this, listArgs);
		firstChild = this.getFirst(parent, alias);

		// 当 firstChild 为 null 时也会添加到父节点
		parent.insertBefore(template, firstChild);
	}

	/**
	 * 移除循环体的第一条数据 array.shift
	 */
	vfor.shift = function(parent, node, newArray, method, updates) {
		var map = this.getChanges(method, newArray.length);
		var firstChild = this.getFirst(parent, updates.alias);
		if (firstChild) {
			parent.removeChild(firstChild);
			// 移位相关的订阅回调
			this.vm.watcher.moveSubs(updates.access, map);
		}
	}

	/**
	 * 删除/替换循环体的指定数据 array.splice
	 */
	vfor.splice = function(parent, node, newArray, method, up, args) {
		// 从数组的哪一位开始修改内容。如果超出了数组的长度，则从数组末尾开始添加内容。
		var start = args.shift();
		// 整数，表示要移除的数组元素的个数。
		// 如果 deleteCount 是 0，则不移除元素。这种情况下，至少应添加一个新元素。
		// 如果 deleteCount 大于 start 之后的元素的总数，则从 start 后面的元素都将被删除（含第 start 位）。
		var deleteCont = args.shift();
		// 要添加进数组的元素。如果不指定，则 splice() 只删除数组元素。
		var insertItems = args, insertLength = args.length;

		// 不删除也不添加
		if (deleteCont === 0 && !insertLength) {
			return;
		}

		var i, udf, map = {}, alias = up.alias, length = newArray.length;

		// 只删除 splice(2, 1);
		var deleteOnly = deleteCont && !insertLength;
		// 只插入 splice(2, 0, 'xxx')
		var insertOnly = !deleteCont && insertLength;
		// 删除并插入 splice(2, 1, 'xxx')
		var deleAndIns = deleteCont && insertLength;

		// 只删除
		if (deleteOnly) {
			for (i = 0; i < length; i++) {
				map[i] = i >= start ? i + deleteCont : i;
			}

			if (util.isEmpty(map)) {
				this.recompile.apply(this, arguments);
				return;
			}
			else {
				this.vm.watcher.moveSubs(up.access, map);
				this.removeEl(parent, alias, start, deleteCont);
			}
		}
		// 只插入 或 删除并插入
		else if (insertOnly || deleAndIns) {
			for (i = 0; i < length; i++) {
				if (insertOnly) {
					map[i] = i < start ? i : (i >= start && i < start + insertLength ? udf : i - insertLength);
				}
				else if (deleAndIns) {
					map[i] = i < start ? i : (i >= start && i < start + insertLength ? udf : i - (insertLength - deleteCont));
				}
			}

			if (util.isEmpty(map) || start === 0 && deleteCont > length) {
				this.recompile.apply(this, arguments);
				return;
			}
			else {
				this.vm.watcher.moveSubs(up.access, map);
			}

			// 先删除选项
			if (deleAndIns) {
				this.removeEl(parent, alias, start, deleteCont);
			}

			// 开始的元素
			var startChild = this.getChild(parent, alias, start);
			// 新取值域
			var scopes = this.updateScopes(up);
			// 编译新添加的列表
			var listArgs = [node, insertItems, start, up.access, alias, up.aliases, up.accesses, scopes, up.maps, up.level];
			// 新增列表模板
			var template = this.buildList.apply(this, listArgs);

			// 更新变化部分
			parent.insertBefore(template, startChild);
		}
	}

	/**
	 * 获取 vfor 循环体的第一个子节点
	 * @param   {DOMElement}  parent  [父节点]
	 * @param   {String}      alias   [循环体对象别名]
	 * @return  {FirstChild}
	 */
	vfor.getFirst = function(parent, alias) {
		var firstChild = null;
		var childNodes = parent.childNodes;

		for (var i = 0; i < childNodes.length; i++) {
			var child = childNodes[i];
			if (child._vfor_alias === alias) {
				firstChild = child;
				break;
			}
		}

		return firstChild;
	}

	/**
	 * 获取 vfor 循环体的最后一个子节点
	 * @param   {DOMElement}  parent   [父节点]
	 * @param   {String}      alias    [循环体对象别名]
	 * @return  {LastChild}
	 */
	vfor.getLast = function(parent, alias) {
		var lastChild = null;
		var childNodes = parent.childNodes;

		for (var i = childNodes.length - 1; i > -1 ; i--) {
			var child = childNodes[i];
			if (child._vfor_alias === alias) {
				lastChild = child;
				break;
			}
		}

		return lastChild;
	}

	/**
	 * 获取 vfor 循环体指定下标的子节点
	 * @param   {DOMElement}  parent  [父节点]
	 * @param   {String}      alias   [循环体对象别名]
	 * @param   {Number}      index   [子节点下标]
	 * @return  {DOMElement}
	 */
	vfor.getChild = function(parent, alias, index) {
		var e = 0, target = null;
		var childNodes = parent.childNodes;

		for (var i = 0; i < childNodes.length; i++) {
			var child = childNodes[i];
			if (child._vfor_alias === alias) {
				if (e === index) {
					target = child;
					break;
				}
				e++;
			}
		}

		return target;
	}

	/**
	 * 删除 vfor 循环体指定的数据
	 * @param   {DOMElement}  parent      [父节点]
	 * @param   {String}      alias       [循环体对象别名]
	 * @param   {Number}      start       [删除的下标起点]
	 * @param   {Number}      deleteCont  [删除个数]
	 */
	vfor.removeEl = function(parent, alias, start, deleteCont) {
		var e = -1, scapegoats = [];
		var childNodes = parent.childNodes;

		for (var i = 0; i < childNodes.length; i++) {
			var child = childNodes[i];
			if (child._vfor_alias === alias) {
				e++;
			}
			// 删除的范围内
			if (e >= start && e < start + deleteCont) {
				scapegoats.push(child);
			}
		}

		util.each(scapegoats, function(scapegoat) {
			parent.removeChild(scapegoat);
			return null;
		});
	}

	/**
	 * 重新编译循环体
	 */
	vfor.recompile = function(parent, node, newArray, method, up) {
		var scapegoat, alias = up.alias;
		var childNodes = parent.childNodes;
		var scopes = this.updateScopes(up);
		var listArgs = [node, newArray, 0, up.access, alias, up.aliases, up.accesses, scopes, up.maps, up.level];

		// 移除旧的监测
		this.vm.watcher.removeSubs(up.access);

		// 重新构建循环板块
		var template = this.buildList.apply(this, listArgs);

		// 移除旧板块
		for (var i = 0; i < childNodes.length; i++) {
			var child = childNodes[i];
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
	 * v-text 指令解析模块
	 */
	function Vtext(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vtext = Vtext.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-text, {{text}} 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vtext.parse = function() {
		this.bind.apply(this, arguments);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}  node
	 * @param   {String}      text
	 */
	vtext.update = function() {
		var updater = this.vm.updater;
		updater.updateTextContent.apply(updater, arguments);
	}

	/**
	 * v-html 指令解析模块
	 */
	function Vhtml(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vhtml = Vhtml.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-html, {{{html}}} 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vhtml.parse = function(fors, node, expression) {
		this.bind.apply(this, [fors, (this.vm.isTextNode(node) ? node.parentNode : node), expression]);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}  node
	 * @param   {String}      html
	 */
	vhtml.update = function() {
		var updater = this.vm.updater;
		updater.updateHtmlContent.apply(updater, arguments);
	}

	/**
	 * v-show 指令解析模块
	 */
	function Vshow(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vshow = Vshow.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-show 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vshow.parse = function() {
		this.bind.apply(this, arguments);
	}

	/**
	 * 更新视图
	 * @param   {DOMElement}   node
	 * @param   {Boolean}      isShow
	 */
	vshow.update = function() {
		var updater = this.vm.updater;
		updater.updateDisplay.apply(updater, arguments);
	}

	/**
	 * v-bind for class 指令解析模块
	 */
	function VClass(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vclass = VClass.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-bind-class
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vclass.parse = function(fors, node, expression) {
		// 提取依赖
		var deps = this.getDeps(fors, expression);
		// 取值域
		var scope = this.getScope(fors, expression);
		// 取值函数
		var getter = this.getEval(fors, expression);
		// 别名映射
		var maps = fors && util.copy(fors.maps);

		var value = getter.call(scope, scope);

		this.updateClass(node, value);

		// 监测依赖
		this.vm.watcher.watch(deps, function(path, last, old) {
			scope = this.updateScope(scope, maps, deps, arguments);

			if (util.isArray(value)) {
				value = [old];
			}
			// 移除旧 class
			this.updateClass(node, value, true);

			// 更新当前值
			value = getter.call(scope, scope);

			// 添加新 class
			this.updateClass(node, value);
		}, this);
	}

	/**
	 * 绑定 classname
	 * @param   {DOMElement}           node
	 * @param   {String|Array|Object}  classValue
	 * @param   {Boolean}              remove
	 */
	vclass.updateClass = function(node, classValue, remove) {
		// single class
		if (util.isString(classValue)) {
			this.update(node, (remove ? null : classValue), (remove ? classValue : null));
		}
		// [classA, classB]
		else if (util.isArray(classValue)) {
			util.each(classValue, function(cls) {
				this.update(node, (remove ? null : cls), (remove ? cls : null));
			}, this);
		}
		// classObject
		else if (util.isObject(classValue)) {
			util.each(classValue, function(isAdd, cls) {
				this.update(node, (remove ? false : isAdd), false, cls);
			}, this);
		}
	}

	/**
	 * 更新节点的 classname
	 * @param   {DOMElement}          node
	 * @param   {String|Boolean}      newcls
	 * @param   {String|Boolean}      oldcls
	 * @param   {String}              classname
	 */
	vclass.update = function() {
		var updater = this.vm.updater;
		updater.updateClassName.apply(updater, arguments);
	}

	/**
	 * v-bind for style 指令解析模块
	 */
	function VStyle(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vstyle = VStyle.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-bind-style
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 */
	vstyle.parse = function(fors, node, expression) {
		// 提取依赖
		var deps = this.getDeps(fors, expression);
		// 取值域
		var scope = this.getScope(fors, expression);
		// 取值函数
		var getter = this.getEval(fors, expression);
		// 别名映射
		var maps = fors && util.copy(fors.maps);
		// 取值对象
		var styleObject = getter.call(scope, scope);

		this.updateStyle(node, styleObject);

		// 监测依赖变化
		this.vm.watcher.watch(deps, function(path, last, old) {
			// 替换整个 styleObject
			if (util.isObject(old)) {
				// 移除旧样式(设为 null)
				util.each(old, function(v, style) {
					old[style] = null;
				});
				this.updateStyle(node, util.extend(last, old));
			}
			else {
				scope = this.updateScope(scope, maps, deps, arguments);
				this.updateStyle(node, getter.call(scope, scope));
			}
		}, this);
	}

	/**
	 * 绑定 styleObject
	 * @param   {DOMElement}  node
	 * @param   {Object}      styleObject
	 * @param   {Boolean}     remove        [是否全部移除]
	 */
	vstyle.updateStyle = function(node, styleObject, remove) {
		if (!util.isObject(styleObject)) {
			return util.warn('v-bind for style must be a type of Object!', styleObject);
		}

		util.each(styleObject, function(value, style) {
			this.update(node, style, (remove ? null : value));
		}, this);
	}

	/**
	 * 更新节点 style
	 * @param   {DOMElement}   node
	 * @param   {String}       style
	 * @param   {String}       value
	 */
	vstyle.update = function() {
		var updater = this.vm.updater;
		updater.updateStyle.apply(updater, arguments);
	}

	/**
	 * v-bind 指令解析模块
	 */
	function Vbind(vm) {
		this.vm = vm;
		this.vclass = new VClass(vm);
		this.vstyle = new VStyle(vm);
		Parser.call(this);
	}
	var vbind = Vbind.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-bind 指令
	 * @param   {Object}      fors        [vfor 数据]
	 * @param   {DOMElement}  node        [指令节点]
	 * @param   {String}      expression  [指令表达式]
	 * @param   {String}      directive   [指令名称]
	 */
	vbind.parse = function(fors, node, expression, directive) {
		// 单个 attribute
		if (directive.indexOf(':') !== -1) {
			var vclass = this.vclass;
			var vstyle = this.vstyle;
			// 属性类型
			var parseType = util.getKeyValue(directive);

			switch (parseType) {
				case 'class':
					vclass.parse.apply(vclass, arguments);
					break;
				case 'style':
					vstyle.parse.apply(vstyle, arguments);
					break;
				default:
					this.parseAttr(fors, node, expression, parseType);
			}
		}
		// 多个 attributes 的 Json 表达式
		else {
			this.parseJson.apply(this, arguments);
		}
	}

	/**
	 * 解析 v-bind="{aa: bb, cc: dd}"
	 * @param   {Object}      fors
	 * @param   {DOMElement}  node
	 * @param   {String}      jsonString
	 */
	vbind.parseJson = function(fors, node, jsonString) {
		// 提取依赖
		var deps = this.getDeps(fors, jsonString);
		// 取值域
		var scope = this.getScope(fors, jsonString);
		// 取值函数
		var getter = this.getEval(fors, jsonString);
		// attr 取值
		var jsonAttr = util.copy(getter.call(scope, scope));
		// 别名映射
		var maps = fors && util.copy(fors.maps);

		this.updateJson(node, jsonAttr);

		// 监测依赖变化
		this.vm.watcher.watch(deps, function(path, last, old) {
			var different, newJsonAttr;

			// 更新取值
			scope = this.updateScope(scope, maps, deps, arguments);

			// 新值
			newJsonAttr = getter.call(scope, scope);
			// 获取新旧 json 的差异
			different = util.diff(newJsonAttr, jsonAttr);

			// 移除旧 attributes
			this.updateJson(node, different.o, true);
			// 添加新 attributes
			this.updateJson(node, different.n);

			jsonAttr = util.copy(newJsonAttr);
		}, this);
	}

	/**
	 * 绑定 Json 定义的 attribute
	 * @param   {DOMElement}  node
	 * @param   {Json}        json
	 * @param   {Boolean}     remove
	 */
	vbind.updateJson = function(node, jsonAttrs, remove) {
		var vclass = this.vclass;
		var vstyle = this.vstyle;

		util.each(jsonAttrs, function(value, type) {
			switch (type) {
				case 'class':
					vclass.updateClass(node, value, remove);
					break;
				case 'style':
					vstyle.updateStyle(node, value, remove);
					break;
				default:
					this.update(node, type, value);
			}
		}, this);
	}

	/**
	 * 解析节点单个 attribute
	 * @param   {Object}       fors
	 * @param   {DOMElement}   node
	 * @param   {String}       expression
	 * @param   {String}       attr
	 */
	vbind.parseAttr = function(fors, node, expression, attr) {
		// 提取依赖
		var deps = this.getDeps(fors, expression);
		// 取值域
		var scope = this.getScope(fors, expression);
		// 取值函数
		var getter = this.getEval(fors, expression);
		// 别名映射
		var maps = fors && util.copy(fors.maps);

		this.update(node, attr, getter.call(scope, scope));

		// 监测依赖变化
		this.vm.watcher.watch(deps, function() {
			scope = this.updateScope(scope, maps, deps, arguments);
			this.update(node, attr, getter.call(scope, scope));
		}, this);
	}

	/**
	 * 更新节点 attribute
	 * @param   {DOMElement}   node
	 * @param   {String}       name
	 * @param   {String}       value
	 */
	vbind.update = function() {
		var updater = this.vm.updater;
		updater.updateAttribute.apply(updater, arguments);
	}

	/**
	 * 格式化表单输出值
	 * @param   {DOMElement}   node
	 * @param   {Mix}          value
	 * @return  {Mix}
	 */
	function formatValue(node, value) {
		return dom.hasAttr(node, 'number') ? +value : value;
	}

	/**
	 * 获取 select 的选中值
	 * @param   {Select}  select
	 * @return  {Array}
	 */
	function getSelecteds(select) {
		var sels = [];
		var options = select.options;
		var getNumber = dom.hasAttr(select, 'number');

		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			var value = option.value;
			if (option.selected) {
				sels.push(getNumber ? +value : formatValue(option, value));
			}
		}

		return sels;
	}


	/**
	 * v-model 指令解析模块
	 */
	function Vmodel(vm) {
		this.vm = vm;
		Parser.call(this);
	}
	var vmodel = Vmodel.prototype = Object.create(Parser.prototype);

	/**
	 * 解析 v-model 指令
	 * @param   {Object}      fors    [vfor 数据]
	 * @param   {DOMElement}  node    [指令节点]
	 * @param   {String}      field   [双向绑定的字段]
	 */
	vmodel.parse = function(fors, node, field) {
		var vm = this.vm;
		var inputs = vm.$inputs;
		var tagName = node.tagName.toLowerCase();
		var type = tagName === 'input' ? dom.getAttr(node, 'type') : tagName;

		if (inputs.indexOf(tagName) === -1) {
			return util.warn('v-model only for using in ' + inputs.join(', '));
		}

		util.def(node, '_vmodel', field);

		var deps = this.getDeps(fors, field);
		var scope = this.getScope(fors, field);
		var getter = this.getEval(fors, field);

		// v-model 只支持静态指令
		var paths = util.makePaths(deps.acc[0] || deps.dep[0]);
		var duplex = util.getDeepValue(this.vm.$data, paths);

		var value = getter.call(scope, scope);
		var bind = util.getExpKey(field) || field;
		var args = [node, value, deps, duplex, bind];

		// 根据不同表单类型绑定数据监测方法
		switch (type) {
			case 'text'    :
			case 'password':
			case 'textarea': this.parseText.apply(this, args); break;
			case 'radio'   : this.parseRadio.apply(this, args); break;
			case 'checkbox': this.parseCheckbox.apply(this, args); break;
			case 'select'  : this.parseSelect.apply(this, args); break;
		}
	}

	/**
	 * v-model for text, textarea
	 */
	vmodel.parseText = function(node, value, deps, duplex, field) {
		var vm = this.vm;
		var updater = vm.updater;

		// 更新视图
		updater.updateTextValue(node, value);

		// 订阅依赖监听
		vm.watcher.watch(deps, function(path, last) {
			updater.updateTextValue(node, last);
		}, this);

		// 绑定事件
		this.bindTextEvent(node, duplex, field);
	}

	/**
	 * text, textarea 绑定数据监测
	 * @param   {Input}    node
	 * @param   {Object}   duplex
	 * @param   {String}   field
	 */
	vmodel.bindTextEvent = function(node, duplex, field) {
		var composeLock;

		// 解决中文输入时 input 事件在未选择词组时的触发问题
		// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
		dom.addEvent(node, 'compositionstart', function() {
			composeLock = true;
		});
		dom.addEvent(node, 'compositionend', function() {
			composeLock = false;
		});

		// input 事件(实时触发)
		dom.addEvent(node, 'input', function() {
			if (!composeLock) {
				duplex[field] = this.value;
			}
		});

		// change 事件(失去焦点触发)
		dom.addEvent(node, 'change', function() {
			duplex[field] = this.value;
		});
	}

	/**
	 * v-model for radio
	 */
	vmodel.parseRadio = function(node, value, deps, duplex, field) {
		var vm = this.vm;
		var updater = vm.updater;

		// 如果已经定义了默认值
		if (dom.hasAttr(node, 'checked')) {
			duplex[field] = value = formatValue(node, node.value);
		}

		// 更新视图
		updater.updateRadioChecked(node, value);

		// 订阅依赖监听
		vm.watcher.watch(deps, function(path, last) {
			updater.updateRadioChecked(node, last);
		}, this);

		// 绑定事件
		this.bindRadioEvent(node, duplex, field);
	}

	/**
	 * radio 绑定数据监测
	 * @param   {Input}    node
	 * @param   {Object}   duplex
	 * @param   {String}   field
	 */
	vmodel.bindRadioEvent = function(node, duplex, field) {
		dom.addEvent(node, 'change', function() {
			duplex[field] = formatValue(this, this.value);
		});
	}

	/**
	 * v-model for checkbox
	 */
	vmodel.parseCheckbox = function(node, value, deps, duplex, field) {
		var vm = this.vm;
		var updater = vm.updater;

		// 如果已经定义了默认值
		if (dom.hasAttr(node, 'checked')) {
			if (util.isBool(value)) {
				duplex[field] = value = true;
			}
			else if (util.isArray(value)) {
				value.push(formatValue(node, node.value));
			}
		}

		// 更新视图
		updater.updateCheckboxChecked(node, value);

		// 订阅依赖监听
		vm.watcher.watch(deps, function(path, last) {
			updater.updateCheckboxChecked(node, last);
		}, this);

		// 绑定事件
		this.bindCheckboxEvent(node, duplex, field, value);
	}

	/**
	 * checkbox 绑定数据监测
	 * @param   {Input}           node
	 * @param   {Object}          duplex
	 * @param   {String}          field
	 * @param   {Array|Boolean}   value
	 */
	vmodel.bindCheckboxEvent = function(node, duplex, field, value) {
		dom.addEvent(node, 'change', function() {
			var checked = this.checked;

			if (util.isBool(value)) {
				duplex[field] = checked;
			}
			else if (util.isArray(value)) {
				var val = formatValue(this, this.value);
				var index = value.indexOf(val);
				// hook
				if (checked) {
					if (index === -1) {
						value.push(val);
					}
				}
				// unhook
				else {
					if (index !== -1) {
						value.splice(index, 1);
					}
				}
			}
		});
	}

	/**
	 * v-model for select
	 */
	vmodel.parseSelect = function(node, value, deps, duplex, field) {
		var isDefined;
		var updater = this.vm.updater;
		var multi = dom.hasAttr(node, 'multiple');

		// 数据模型定义为单选
		if (util.isString(value)) {
			if (multi) {
				return util.warn('<select> cannot be multiple when the model set [' + field + '] as not Array!');
			}
			isDefined = Boolean(value);
		}
		// 数据模型定义为多选
		else if (util.isArray(value)) {
			if (!multi) {
				return util.warn('the model [' + field + '] cannot set as Array when <select> has no multiple propperty!');
			}
			isDefined = value.length > 0;
		}
		else {
			return util.warn('the model [' + field + '] use in <select> must be a type of String or Array!');
		}

		// 数据模型中定义初始的选中状态
		if (isDefined) {
			updater.updateSelectChecked(node, value, multi);
		}
		// 模板中定义初始状态
		else {
			var selects = getSelecteds(node);
			duplex[field] =  multi ? selects : selects[0];
		}

		// 订阅依赖监测
		this.vm.watcher.watch(deps, function(path, last) {
			updater.updateSelectChecked(node, last, multi);
		});

		// 绑定事件
		this.bindSelectEvent(node, duplex, field, multi);
	}

	/**
	 * select 绑定数据监测
	 * @param   {Input}     node
	 * @param   {Object}    duplex
	 * @param   {String}    field
	 * @param   {Boolean}   multi
	 */
	vmodel.bindSelectEvent = function(node, duplex, field, multi) {
		dom.addEvent(node, 'change', function() {
			var selects = getSelecteds(this);
			duplex[field] =  multi ? selects : selects[0];
		});
	}

	/**
	 * 元素编译/指令提取模块
	 * @param  {DOMElement}  element  [视图的挂载原生 DOM]
	 * @param  {Object}      model    [数据模型对象]
	 */
	function Compiler(element, model) {
		if (!this.isElementNode(element)) {
			return util.warn('element must be a type of DOMElement: ', element);
		}

		if (!util.isObject(model)) {
			return util.warn('model must be a type of Object: ', model);
		}

		// 缓存根节点
		this.$element = element;
		// 根节点转文档碎片（element 将被清空）
		this.$fragment = util.nodeToFragment(this.$element);

		// 数据模型对象
		this.$data = model;
		// DOM 注册索引
		util.defRec(model, '$els', {});
		// 子取值域索引
		util.defRec(model, '$scope', {});

		// 未编译节点缓存队列
		this.$unCompileNodes = [];
		// 根节点是否已完成编译
		this.$rootComplied = false;

		// 视图刷新模块
		this.updater = new Updater(this);
		// 数据订阅模块
		this.watcher = new Watcher(this.$data);
		// 指令解析模块
		this.von = new Von(this);
		this.vel = new Vel(this);
		this.vif = new Vif(this);
		this.vfor = new Vfor(this);
		this.vtext = new Vtext(this);
		this.vhtml = new Vhtml(this);
		this.vshow = new Vshow(this);
		this.vbind = new Vbind(this);
		this.vmodel = new Vmodel(this);

		// v-model 限制使用的表单元素
		this.$inputs = 'input|select|textarea'.split('|');

		this.init();
	}

	var cp = Compiler.prototype;

	cp.init = function() {
		this.complieElement(this.$fragment, true);
	}

	/**
	 * 编译文档碎片/节点
	 * @param   {Fragment|DOMElement}  element   [文档碎片/节点]
	 * @param   {Boolean}              root      [是否是编译根节点]
	 * @param   {Object}               fors      [vfor 数据]
	 */
	cp.complieElement = function(element, root, fors) {
		var this$1 = this;

		var node, childNodes = element.childNodes;

		if (root && this.hasDirective(element)) {
			this.$unCompileNodes.push([element, fors]);
		}

		for (var i = 0; i < childNodes.length; i++) {
			node = childNodes[i];

			if (this$1.hasDirective(node)) {
				this$1.$unCompileNodes.push([node, fors]);
			}

			if (node.childNodes.length && !this$1.isLateCompile(node)) {
				this$1.complieElement(node, false, fors);
			}
		}

		if (root) {
			this.compileAll();
		}
	}

	/**
	 * 节点是否含有合法指令
	 * @param   {DOMElement}  node
	 * @return  {Number}
	 */
	cp.hasDirective = function(node) {
		var this$1 = this;

		var nodeAttrs, text = node.textContent;
		var reg = /(\{\{.*\}\})|(\{\{\{.*\}\}\})/;

		if (this.isElementNode(node)) {
			nodeAttrs = node.attributes;
			for (var i = 0; i < nodeAttrs.length; i++) {
				if (this$1.isDirective(nodeAttrs[i].name)) {
					return true;
				}
			}
		}
		else if (this.isTextNode(node) && reg.test(text)) {
			return true;
		}
	}

	/**
	 * 编译节点缓存队列
	 */
	cp.compileAll = function() {
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
	cp.complieDirectives = function(info) {
		var this$1 = this;

		var node = info[0], fors = info[1];

		if (this.isElementNode(node)) {
			var _vfor, attrs = [];
			// node 节点集合转为数组
			var nodeAttrs = node.attributes;

			for (var i = 0; i < nodeAttrs.length; i++) {
				var atr = nodeAttrs[i];
				var name = atr.name;
				if (this$1.isDirective(name)) {
					if (name === 'v-for') {
						_vfor = atr;
					}
					attrs.push(atr);
				}
			}

			// vfor 编译时标记节点的指令数
			if (_vfor) {
				util.def(node, '_vfor_directives', attrs.length);
				attrs = [_vfor];
				_vfor = null;
			}

			// 编译节点指令
			util.each(attrs, function(attr) {
				this.compile(node, attr, fors);
			}, this);
		}
		else if (this.isTextNode(node)) {
			this.compileText(node, fors);
		}
	}

	/**
	 * 编译元素节点指令
	 * @param   {DOMElement}   node
	 * @param   {Object}       attr
	 * @param   {Array}        fors
	 */
	cp.compile = function(node, attr, fors) {
		var dir = attr.name;
		var exp = attr.value;
		var args = [fors, node, exp, dir];

		// 移除指令标记
		dom.removeAttr(node, dir);

		// 动态指令：v-bind:xxx
		if (dir.indexOf('v-bind') === 0) {
			this.vbind.parse.apply(this.vbind, args);
		}
		// 动态指令：v-on:xxx
		else if (dir.indexOf('v-on') === 0) {
			this.von.parse.apply(this.von, args);
		}
		// 静态指令
		else {
			switch (dir) {
				case 'v-el':
					this.vel.parse.apply(this.vel, args);
					break;
				case 'v-text':
					this.vtext.parse.apply(this.vtext, args);
					break;
				case 'v-html':
					this.vhtml.parse.apply(this.vhtml, args);
					break;
				case 'v-show':
					this.vshow.parse.apply(this.vshow, args);
					break;
				case 'v-if':
					this.vif.parse.apply(this.vif, args);
					break;
				case 'v-else':
					util.def(node, '_directive', 'v-else');
					break;
				case 'v-model':
					this.vmodel.parse.apply(this.vmodel, args);
					break;
				case 'v-for':
					this.vfor.parse.apply(this.vfor, args);
					break;
				case 'v-pre':
					break;
				default: util.warn('[' + dir + '] is an unknown directive!');
			}
		}
	}

	/**
	 * 编译文本节点 {{text}} or {{{html}}}
	 * @param   {DOMElement}   node
	 * @param   {Object}       fors
	 */
	cp.compileText = function(node, fors) {
		var exp, match, matches, pieces, tokens = [];
		var text = node.textContent.trim().replace(/\n/g, '');
		var reghtml = /\{\{\{(.+?)\}\}\}/g, regtext = /\{\{(.+?)\}\}/g;

		// html match
		if (reghtml.test(text)) {
			matches = text.match(reghtml);
			match = matches[0];
			exp = match.replace(/\s\{|\{|\{|\}|\}|\}/g, '');
			if (match.length !== text.length) {
				return util.warn('[' + text + '] compile for HTML can not have a prefix or suffix!');
			}
			this.vhtml.parse.call(this.vhtml, fors, node, exp);
		}
		// text match
		else {
			pieces = text.split(regtext);
			matches = text.match(regtext);

			// 文本节点转化为常量和变量的组合表达式
			// 'a {{b}} c' => '"a " + b + " c"'
			util.each(pieces, function(piece) {
				// {{text}}
				if (matches.indexOf('{{' + piece + '}}') !== -1) {
					tokens.push('(' + piece + ')');
				}
				// 字符常量
				else if (piece) {
					tokens.push('"' + piece + '"');
				}
			});

			this.vtext.parse.call(this.vtext, fors, node, tokens.join('+'));
		}
	}

	/**
	 * 停止编译节点的剩余指令，如 vfor 的根节点
	 * @param   {DOMElement}  node
	 */
	cp.blockCompile = function(node) {
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
	cp.isElementNode = function(element) {
		return element.nodeType === 1;
	}

	/**
	 * 是否是文本节点
	 * @param   {DOMElement}   element
	 * @return  {Boolean}
	 */
	cp.isTextNode = function(element) {
		return element.nodeType === 3;
	}

	/**
	 * 是否是合法指令
	 * @param   {String}   directive
	 * @return  {Boolean}
	 */
	cp.isDirective = function(directive) {
		return directive.indexOf('v-') === 0;
	}

	/**
	 * 节点的子节点是否延迟编译
	 * 单独处理 vif, vfor 和 vpre 子节点的编译
	 * @param   {DOMElement}   node
	 * @return  {Boolean}
	 */
	cp.isLateCompile = function(node) {
		return dom.hasAttr(node, 'v-if') || dom.hasAttr(node, 'v-for') || dom.hasAttr(node, 'v-pre');
	}

	/**
	 * 检查根节点是否编译完成
	 */
	cp.checkCompleted = function() {
		if (this.$unCompileNodes.length === 0 && !this.$rootComplied) {
			this.rootCompleted();
		}
	}

	/**
	 * 根节点编译完成，更新视图
	 */
	cp.rootCompleted = function() {
		this.$rootComplied = true;
		this.$element.appendChild(this.$fragment);
	}

	/**
	 * 销毁 vm 编译实例
	 * @return  {[type]}  [description]
	 */
	cp.destroy = function() {
		this.watcher.destroy();
		dom.empty(this.$element);
		this.$fragment = this.$data = this.$unCompileNodes = this.updater = this.$inputs = null;
		this.von = this.vel = this.vif = this.vfor = this.vtext = this.vhtml = this.vshow = this.vbind = this.vmodel = null;
	}

	/**
	 * MVVM 构造函数，封装 Complier
	 * @param  {DOMElement}  element  [视图的挂载原生 DOM]
	 * @param  {Object}      model    [数据模型对象]
	 * @param  {Function}    context  [事件及 watch 的回调上下文]
	 */
	function MVVM(element, model, context) {
		var ctx = this.context = context || this;

		// 将事件函数 this 指向调用者
		util.each(model, function(value, key) {
			if (util.isFunc(value)) {
				model[key] = value.bind(ctx);
			}
		});

		// 初始数据备份
		this.backup = util.copy(model);

		// ViewModel 实例
		this.vm = new Compiler(element, model);

		// 数据模型
		this.$ = this.vm.$data;
	}

	var mvp = MVVM.prototype;

	/**
	 * 获取指定数据模型
	 * 如果获取的模型为对象或数组，将会保持引用关系
	 * @param   {String}  key  [数据模型字段]
	 * @return  {Mix}
	 */
	mvp.get = function(key) {
		return util.isString(key) ? this.$[key] : this.$;
	}

	/**
	 * 获取指定数据模型的副本
	 * 如果获取的模型为对象或数组，原数据将不会保持引用关系，只返回一个拷贝的副本
	 * @param   {String}  key  [数据模型字段]
	 * @return  {Mix}
	 */
	mvp.getItem = function(key) {
		return util.copy(this.get(key));
	}

	/**
	 * 设置数据模型的值，key 为 json 时则批量设置
	 * @param  {String}  key    [数据模型字段]
	 * @param  {Mix}     value  [值]
	 */
	mvp.set = function(key, value) {
		var vm = this.$;
		// 设置单个
		if (util.isString(key)) {
			vm[key] = value;
		}

		// 批量设置
		if (util.isObject(key)) {
			util.each(key, function(v, k) {
				vm[k] = v;
			});
		}
	}

	/**
	 * 重置数据模型至初始状态
	 * @param   {Array|String}  key  [数据模型字段，或字段数组，空则重置所有]
	 */
	mvp.reset = function(key) {
		var vm = this.$;
		var backup = this.backup;

		// 重置单个
		if (util.isString(key)) {
			vm[key] = backup[key];
		}
		// 重置多个
		else if (util.isArray(key)) {
			util.each(key, function(v) {
				vm[v] = backup[v];
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
	 * @param   {Function}  callback  [监测变化回调]
	 * @param   {Boolean}   deep      [数组深层监测]
	 */
	mvp.watch = function(model, callback, deep) {
		this.vm.watcher.watchModel(model, function(path, last, old) {
			callback.call(this, path, last, old);
		}, this.context, null, deep);
	}

	/**
	 * 销毁 mvvm 实例
	 */
	mvp.destroy = function() {
		this.vm.destroy();
		this.context = this.vm = this.backup = this.$ = null;
	}

	/**
	 * Component 基础视图组件
	 */
	var Component = Module.extend({
		/**
		 * init 组件初始化方法
		 * @param  {Object}  config  [组件参数配置]
		 * @param  {Object}  parent  [父组件对象]
		 */
		init: function(config, parent) {
			this._config = this.cover(config, {
				// 组件目标容器
				'target'  : null,
				// dom 元素的标签
				'tag'     : 'div',
				// 元素的 class
				'class'   : '',
				// 元素的 css
				'css'     : null,
				// 元素的 attr
				'attr'    : null,
				// 视图布局内容
				'html'    : '',
				// 静态模板 uri
				'template': '',
				// 模板拉取请求参数
				'tplParam': null,
				// mvvm 数据模型对象
				'model'   : null,
				// 视图渲染完成后的回调函数
				'cbRender': 'viewReady'
			});

			// 通用 dom 处理方法
			this.$ = dom;
			// 组件元素
			this.el = null;
			// mvvm 实例
			this.vm = null;
			// 组件是否已经创建完成
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
		 * 加载模板布局文件
		 */
		_loadTemplate: function() {
			var c = this.getConfig();
			var uri = c.template;

			ajax.load(uri, c.tplParam, function(err, data) {
				var html;

				if (err) {
					html = err.status + ': ' + uri;
					util.warn(err);
				}
				else {
					html = data.result;
				}

				this.setConfig('html', html);
				this._render();
			}, this);
		},

		/**
		 * 组件配置参数合并、覆盖
		 * @param  {Object}  child   [子类组件配置参数]
		 * @param  {Object}  parent  [父类组件配置参数]
		 * @return {Object}          [合并后的配置参数]
		 */
		cover: function(child, parent) {
			if (!util.isObject(child)) {
				child = {};
			}
			if (!util.isObject(parent)) {
				parent = {};
			}
			return util.extend(true, {}, parent, child);
		},

		/**
		 * 获取组件配置参数
		 * @param  {String}  name  [参数字段名称，支持/层级]
		 */
		getConfig: function(name) {
			return this.config(this._config, name);
		},

		/**
		 * 设置组件配置参数
		 * @param {String}  name   [配置字段名]
		 * @param {Mix}     value  [值]
		 */
		setConfig: function(name, value) {
			return this.config(this._config, name, value);
		},

		/**
		 * 设置/读取配置对象
		 * @param  {Object}   data   [配置对象]
		 * @param  {String}   name   [配置名称, 支持/分隔层次]
		 * @param  {Mix}      value  [不传为读取配置信息]
		 * @return {Mix}             [返回读取的配置值]
		 */
		config: function(data, name, value) {
			var udf, set = (value !== udf);

			if (name) {
				var ns = name.split('/');

				while (ns.length > 1 && util.hasOwn(data, ns[0])) {
					data = data[ns.shift()];
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
			else {
				return data[name];
			}
		},

		/**
		 * 渲染组件视图、初始化配置
		 */
		_render: function() {
			// 判断是否已创建过
			if (this._ready) {
				return this;
			}

			this._ready = true;

			var c = this.getConfig();

			var el = this.el = util.createElement(c.tag);

			// 添加 class
			var cls = c.class;
			if (cls && util.isString(cls)) {
				util.each(cls.split(' '), function(classname) {
					dom.addClass(el, classname);
				});
			}

			// 添加 css
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

			// 初始化 mvvm 对象
			var model = c.model;
			if (util.isObject(model)) {
				this.vm = new MVVM(el, model, this);
			}

			// 追加到目标容器
			var target = c.target;
			if (target) {
				target.appendChild(el);
			}

			// 组件视图渲染完成回调方法
			var cb = this[c.cbRender];
			if (util.isFunc(cb)) {
				cb.call(this);
			}
		},

		/**
		 * 返回当前 dom 中第一个匹配特定选择器的元素
		 * @param  {String}     selector  [子元素选择器]
		 * @return {DOMObject}
		 */
		query: function(selector) {
			return this.el.querySelector(selector);
		},

		/**
		 * 返回当前 dom 中匹配一个特定选择器的所有的元素
		 * @param  {String}    selectors  [子元素选择器]
		 * @return {NodeList}
		 */
		queryAll: function(selectors) {
			return this.el.querySelectorAll(selectors);
		},

		/**
		 * 元素添加绑定事件
		 */
		bind: function(node, evt, callback, capture) {
			if (util.isString(callback)) {
				callback = this[callback];
			}
			return eventer.add(node, evt, callback, capture, this);
		},

		/**
		 * 元素解除绑定事件
		 */
		unbind: function(node, evt, callback, capture) {
			if (util.isString(callback)) {
				callback = this[callback];
			}
			return eventer.remove(node, evt, callback, capture);
		},

		/**
		 * 组件销毁后的回调函数
		 */
		afterDestroy: function() {
			var vm = this.vm;
			var el = this.el;
			var parent = this.getConfig('target');

			// 销毁 mvvm 实例
			if (vm) {
				vm.destroy();
			}

			// 销毁 dom 对象
			if (parent) {
				parent.removeChild(el);
			}

			this.$ = el = vm = null;
		}
	});

	/**
	 * sugar 构造函数入口
	 */
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
		 * 系统核心实例
		 * @type  {Object}
		 */
		this.core = core;

		/**
		 * 基础模块类
		 * @type  {Class}
		 */
		this.Module = Module;

		/**
		 * 视图组件基础模块
		 * @type  {Class}
		 */
		this.Component = Component;
	}

	var index = new Sugar();

	return index;

}));