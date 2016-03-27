/**
 * 通用函数库
 */
define(function() {
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
});