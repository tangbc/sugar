/**
 * 通用函数库
 */
define(function() {
	var WIN = window;
	var DOC = WIN.document;
	var OP = Object.prototype;
	var AP = Array.prototype;

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
	 * 深复制对象
	 */
	function _extendObject(target, source) {
		this.each(source, function(value, key) {
			// 拷贝值为对象
			if (isObject(value)) {
				if (target[key] === value) {
					return false;
				}

				// target未定义key
				if (!this.hasOwn(target, key)) {
					target[key] = {};
				}
				_extendObject(target[key], value);
			}
			// 拷贝值为数组
			else if (isArray(value)) {
				target[key] = value.slice(0);
			}
			else {
				target[key] = value;
			}
		}, this);
	}


	/**
	 * Util构造函数
	 */
	function Util() {
		this.WIN = WIN;
		this.DOC = DOC;
		this.OP = OP;
		this.AP = AP;

		this.isFunc = isFunc;
		this.isArray = isArray;
		this.isNumber = isNumber;
		this.isObject = isObject;
		this.isString = isString;
		this.isBoolean = isBoolean;
	}

	var p = Util.prototype;
	var udf, cons = window.console;


	/**
	 * 打印日志
	 */
	p.log = function() {
		cons.log.apply(cons, arguments);
	}

	/**
	 * 打印错误
	 */
	p.error = function() {
		cons.error.apply(cons, arguments);
	}

	/**
	 * 打印警告信息
	 */
	p.warn = function() {
		cons.warn.apply(cons, arguments);
	}

	/*
	 * 对象自有属性检测
	 */
	p.hasOwn = function(obj, key) {
		return OP.hasOwnProperty.call(obj, key);
	}

	/**
	 * arguments对象转真实数组
	 * @param  {Object}  args
	 * @return {Array}
	 */
	p.argumentsToArray = function(args) {
		if  (args instanceof arguments.constructor) {
			return AP.slice.call(args);
		}
		else {
			return args;
		}
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
	p.defineProperty = function(object, property, value, writable, enumerable, configurable) {
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
	p.each = function(items, callback, context) {
		var ret, i, leng;

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
			for (i = 0, leng = items.length; i < leng; i++) {
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
	 * 拷贝对象
	 * @return  {Object}
	 */
	p.extend = function() {
		var result = {};
		var item, items = arguments;
		var i = 0, leng = items.length;

		for (; i < leng; i++) {
			item = items[i];
			if (isObject(item)) {
				_extendObject.call(this, result, item);
			}
		}

		return result;
	}

	/**
	 * 复制对象或数组
	 * @param   {Object|Array}  target
	 * @return  {Mix}
	 */
	p.copy = function(target) {
		var ret;

		if (isArray(target)) {
			ret = target.slice(0);
		}
		else if (isObject(target)) {
			ret = this.extend(target);
		}
		else {
			ret = obj;
		}

		return ret;
	}

	/**
	 * 字符串首字母大写
	 */
	p.ucFirst = function(str) {
		var first = str.charAt(0).toUpperCase();
		return first + str.substr(1);
	}

	/**
	 * 解析模块路径，返回真实路径和导出点
	 * @param   {String}  uri  [子模块uri]
	 * @return  {Object}
	 */
	p.resolveUri = function(uri) {
		if (!isString(uri)) {
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
	 * 设置/读取配置对象
	 * @param  {Object}  cData  [配置对象]
	 * @param  {String}  name   [配置名称, 支持/分隔层次]
	 * @param  {Mix}     value  [不传为读取配置信息, null为删除配置, 其他为设置值]
	 * @return {Mix}            [返回读取的配置值]
	 */
	p.config = function(cData, name, value) {
		// 不传cData配置对象
		if (isString(cData) || arguments.length === 0) {
			value = name;
			name = cData;
			cData = {};
		}

		var set = (value !== udf);
		var remove = (value === null);
		var data = cData;

		if (name) {
			var ns = name.split('/');
			while (ns.length > 1 && this.hasOwn(data, ns[0])) {
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
	}

	/**
	 * 去掉字符串中所有空格
	 * @param   {String}  string
	 * @return  {String}
	 */
	p.removeSpace = function(string) {
		return string.replace(/\s/g, '');
	}

	/**
	 * 拆解字符键值对，返回键和值
	 * @param   {String}        expression
	 * @param   {Boolean}       both         [是否返回键和值]
	 * @return  {String|Array}
	 */
	p.getStringKeyValue = function(expression, both) {
		var array = expression.split(':');
		return both ? array : array.pop();
	}

	/**
	 * 分解字符串函数参数
	 * @param   {String}  expression
	 * @return  {Array}
	 */
	p.stringToParameters = function(expression) {
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
	p.jsonStringToArray = function(jsonString) {
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
	p.createElement = function(tag) {
		return DOC.createElement(tag);
	}

	/**
	 * 返回一个空文档碎片
	 * @return  {Fragment}
	 */
	p.createFragment = function() {
		return DOC.createDocumentFragment();
	}

	/**
	 * DOMElement转换成文档片段
	 * @param   {DOMElement}  element
	 */
	p.nodeToFragment = function(element) {
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
	p.stringToFragment = function(html) {
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


	return new Util();
});