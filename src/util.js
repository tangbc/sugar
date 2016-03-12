/**
 * sugar框架辅助功能函数库
 */
define(function() {
	var UDF, UTIL = {};

	var WIN = UTIL.GLOBAL = window;
	var DOC = UTIL.DOC = WIN.document;
	var OP = UTIL.OP = Object.prototype;
	var AP = UTIL.AP = Array.prototype;

	var docBody = DOC.body;
	var docElem = DOC.documentElement;

	/**
	 * typeOfObject 是否是对象
	 */
	function typeOfObject(obj) {
		return (obj && typeof(obj) === 'object');
	}

	/**
	 * isObject 是否是对象自变量, {}或new Object()的形式
	 */
	function isObject(obj) {
		return OP.toString.call(obj) === '[object Object]';
	}

	/**
	 * isArray 是否是真数组, []或new Array()的形式
	 */
	function isArray(obj) {
		return OP.toString.call(obj) === '[object Array]';
	}

	/**
	 * isFunc 是否是函数
	 */
	function isFunc(fn) {
		return fn instanceof Function;
	}

	/**
	 * isString 是否是字符串
	 */
	function isString(str) {
		return typeof(str) === 'string';
	}

	/**
	 * isBoolean 是否是布尔值
	 */
	function isBoolean(bool) {
		return typeof(bool) === 'boolean';
	}

	/**
	 * isNumber 是否是数字
	 */
	function isNumber(num) {
		return typeof(num) === 'number' && !isNaN(num);
	}

	/**
	 * isFakeArray 是否是假数组
	 */
	function isFakeArray(val) {
		var key;
		for (key in val) {
			if (key === 'length') {
				if (isNaN(+val[key])) {
					return false;
				}
			}
			else if (has(val, key) && isNaN(+key)) {
				return false;
			}
		}
		return true;
	}

	/**
	 * isPlainObject 是否是纯粹对象
	 */
	function isPlainObject(val) {
		if (!isObject(val) || val.nodeType || val === window) {
			return false;
		}
		try {
			if (val.constructor && !has(val.constructor.prototype, 'isPrototypeOf')) {
				return false;
			}
		}
		catch (e) {
			return false;
		}
		return true;
	}

	/**
	 * 检测是否是jQuery对象
	 * @param  {Mix}     elm [需要检测的参数]
	 * @return {Boolean}     [result]
	 */
	function isJquery(elm) {
		return WIN.jQuery ? elm instanceof jQuery : false;
	}

	/**
	 * 工具方法导出
	 */
	UTIL.typeOfObject = typeOfObject;
	UTIL.isObject = isObject;
	UTIL.isArray = isArray;
	UTIL.isFunc = isFunc;
	UTIL.isString = isString;
	UTIL.isBoolean = isBoolean;
	UTIL.isNumber = isNumber;
	UTIL.isFakeArray = isFakeArray;
	UTIL.isPlainObject = isPlainObject;
	UTIL.isJquery = isJquery;

	/**
	 * 日志函数
	 */
	var cons = WIN.console || {};
	UTIL.log = function() {
		cons.log.apply(cons, arguments);
	}
	UTIL.error = function() {
		cons.error.apply(cons, arguments);
	}
	UTIL.warn = function() {
		cons.warn.apply(cons, arguments);
	}

	/**
	 * 读取对象（数据）属性
	 * @param   {Object}  data  [对象数据]
	 * @param   {String}  name  [属性名称]
	 * @return  {Mix}           [读取结果]
	 */
	UTIL.get = function(data, name) {}

	/**
	 * 设置对象（数据）属性
	 * @param   {Object}  data  [对象数据]
	 * @param   {String}  name  [属性名称]
	 * @return  {Mix}     value [设置值]
	 * @return  {Object}  data  [对象数据]
	 */
	UTIL.set = function(data, name, value) {}

	/**
	 * object定义或修改属性
	 * @param   {Object|Array}  object         [数组或对象]
	 * @param   {String}        property       [属性或数组下标]
	 * @param   {Mix}           value          [属性的修改值/新值]
	 * @param   {Boolean}       writable       [该属性是否能被赋值运算符改变]
	 * @param   {Boolean}       enumerable     [该属性是否出现在枚举中]
	 * @param   {Boolean}       configurable   [该属性是否能够被改变或删除]
	 */
	UTIL.defineProperty = function(object, property, value, writable, enumerable, configurable) {
		return Object.defineProperty(object, property, {
			'value'       : value,
			'writable'    : !!writable,
			'enumerable'  : !!enumerable,
			'configurable': !!configurable
		});
	}

	/*
	 * has 自有属性检测
	 */
	function has(key, obj) {
		if (key === UDF) {
			return false;
		}
		return OP.hasOwnProperty.call(obj, key);
	}
	UTIL.has = has;

	/**
	 * scrollTo 自定义滚动条位置
	 * @param  {Number} x [横位置]
	 * @param  {Number} y [纵位置]
	 */
	UTIL.scrollTo = function(x, y) {
		x = x || 0;
		y = y || 0;
		WIN.scrollTo(x, y);
	}

	/**
	 * argumentsToArray 参数转数组
	 * @param  {Object} args [参数]
	 * @return {Array}       [数组]
	 */
	UTIL.argumentsToArray = function(args) {
		if  (args instanceof arguments.constructor) {
			return AP.slice.call(args);
		}
		else {
			return args;
		}
	}

	/**
	 * getKey 获取对象键值名
	 * @param  {String} val  [值]
	 * @param  {Object} obj  [值所在的对象]
	 * @return {String}      [键值名称]
	 */
	UTIL.getKey = function(val, obj) {
		var key = '';
		if ((val && obj) && isObject(obj)) {
			for (key in obj) {
				if (has(key, obj)) {
					return key;
				}
			}
		}
		return null;
	}

	/**
	 * isEmpty 检测是否为空对象或者空数组
	 * @param  {String} val  [值]
	 * @return {Boolean}     [空为真,非空为假]
	 */
	UTIL.isEmpty = function(val) {
		if (isObject(val)) {
			for (var property in val) {
				if (has(property, val)) {
					return false;
				}
				return true;
			}
		}
		else if (isArray(val)) {
			return (val.length === 0);
		}
	}

	/**
	 * each 遍历数组或对象
	 * @param  {Array,Object}  items     [数组或对象]
	 * @param  {Fuction}       callback  [回调函数]
	 * @param  {Object}        context   [作用域]
	 */
	UTIL.each = function(items, callback, context) {
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
		else if (isObject(items)) {
			for (i in items) {
				if (!has(i, items)) {
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
	 * guid 获取一个唯一的ID
	 * @param  {String} fix [前缀]
	 * @return {Mix} 返回唯一的ID号
	 */
	var _guid = 1;
	UTIL.guid = function(fix) {
		if (fix) {
			return '' + fix + (_guid++);
		}
		else {
			return _guid++;
		}
	}

	/**
	 * random 生成指定范围的随机整数(无范围返回时间戳)
	 * @param  {Number} begin  [开始]
	 * @param  {Number} end    [结束]
	 */
	UTIL.random = function(begin, end) {
		var ret;
		if (arguments.length === 2) {
			ret = parseInt(Math.random() * (end - begin + 1) + begin, 10);
		}
		else {
			ret = +new Date();
		}
		return ret;
	}

	/**
	 * htmlEncode 将html标签转义
	 * @param  {String} html  [字符]
	 */
	UTIL.htmlEncode = function(html) {
		var tag = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;'
		}
		function esc_rp(m) {
			return tag[m];
		}
		return (typeof(html) != 'string') ? html : html.replace(/[&<>']/g, esc_rp);
	}

	/**
	 * find 根据字段和值查找数组中的元素
	 * @param  {Array}   arr    [数组]
	 * @param  {Mix}     value  [查询值]
	 * @param  {String}  field  [对应的字段名]
	 */
	UTIL.find = function(arr, value, field) {
		var ret = null;
		this.each(arr, function(item) {
			if (item[field] === value) {
				ret = item;
				return false;
			}
		});
		return ret;
	}

	/**
	 * parse 解析get请求参数
	 * @param   {Object}  param  [参数JSON]
	 * @param   {String}  param  [参数JSON]
	 * @return  {String}         [解析的字符创]
	 */
	UTIL.parse = function(param) {
		var arr = [];
		for (var pro in param) {
			arr.push(pro + '=' + param[pro]);
		}
		return '?' + arr.join('&');
	}

	/**
	 * getClientHeight 获取页面可视区高度
	 */
	var dcm = DOC.compatMode === 'CSS1Compat';
	UTIL.getClientHeight = function() {
		return dcm ? docElem.clientHeight : docBody.clientHeight;
	}

	/**
	 * getClientWidth 获取页面可视区宽度
	 */
	UTIL.getClientWidth = function() {
		return dcm ? docElem.clientWidth : docBody.clientWidth;
	}

	/**
	 * getClient 获取页面可视区信息
	 */
	UTIL.getClient = function() {
		return {
			'width': this.getClientWidth(),
			'height': this.getClientHeight()
		}
	}

	/**
	 * removeTags 去掉html标签
	 */
	UTIL.removeTags = function(html) {
		return String(html).replace(/<[^>]+>/g, '');
	}

	/**
	 * fixZero 自动补0, (9 , 1) -> 09; (9 , 3) -> 0009
	 * num: 原始数值 ; zeros: 补0个数
	 */
	UTIL.fixZero = function(num, zeros) {
		var b, v, x = 10, y, ns = String(num).length;
		if (!isNumber(zeros) || !isNumber(zeros)) {
			return num;
		}
		y = ns + zeros;
		b = Math.pow(x, y);
		v = b + num;
		return String(v).substr(1);
	}

	/*
	 * 模板替换
	 * eg. UTIL.templateReplace('<a href="{1}">{2}</a>', 'http://www.tangbc.com', '小前端')
	 * =>  '<a href="http://www.tangbc.com">小前端</a>')
	 */
	var templateReplaceList;
	var templateReplaceRegx = /\%(\d+)|\{\d+\}/g;
	function _templateReplace(match) {
		if (match[1] > 0 && templateReplaceList[match[1]] !== UDF) {
			return templateReplaceList[match[1]];
		}
		else {
			return match[0];
		}
	}
	UTIL.templateReplace = function(template /*, replaceN ... */) {
		templateReplaceList = arguments;
		return template.replace(templateReplaceRegx, _templateReplace);
	}

	/**
	 * 防环状嵌套克隆
	 * @param {Mix} obj 克隆的对象值
	 */
	function CloneObject(obj) {
		if (isPlainObject(obj) || isArray(obj)) {
			var cloneKey = '___deep_clone___';

			// 已经被克隆过, 返回新克隆对象
			if (obj[cloneKey]) {
				return obj[cloneKey];
			}

			var objClone = obj[cloneKey] = (obj instanceof Array ? [] : {});
			for (var key in obj) {
				if (key !== cloneKey && has(key, obj)) {
					objClone[key] = (typeOfObject(obj[key]) ? CloneObject(obj[key]) : obj[key]);
				}
			}
			delete obj[cloneKey];
			return objClone;
		}
		return obj;
	}

	/**
	 * extend 扩展合并
	 */
	function ExtendObject(dst, src, deep) {
		if (dst === src) {
			return dst;
		}
		var i, type = (dst instanceof Array ? 0 : 1) + (src instanceof Array ? 0 : 2);
		switch (type) {
			// 都是数组, 合并有值的, 忽略undefined的
			case 0:
				for (i = src.length-1; i >= 0; i--) {
					ExtendItem(dst, i, src[i], 0, deep);
				}
			break;
			// 目标是对象, 新值是数组
			case 1:
				dst = CloneObject(src);
			break;
			// 目标是数组, 新值是对象
			case 2:
				if (!isFakeArray(src)) {
					dst = CloneObject(src);
				}
			break;
			// 都是对象
			case 3:
				if (!dst) {
					dst = {};
				}
				for (i in src) {
					if (has(i, src)) {
						ExtendItem(dst, i, src[i], 1, deep);
					}
				}
			break;
		}
		return dst;
	}
	function ExtendItem(dst, key, value, remove, deep) {
		// undefined 时删除值
		if (value === UDF) {
			if (remove) {
				delete dst[key];
			}
		}
		else if (value && (isArray(value) || isPlainObject(value))) {
			// 新值为对象
			if (dst[key] === value) {
				return;
			}
			// 继续合并数组和简答对象
			if (deep !== 0) {
				dst[key] = ExtendObject(dst[key], value, --deep);
			}
			// 克隆新对象赋值
			else {
				dst[key] = CloneObject(value);
			}
		}
		// 直接赋值
		else {
			dst[key] = value;
		}
	}
	UTIL.extend = function() {
		var args = arguments;
		var len = args.length;
		var deep = args[0];
		var target = args[1];
		var i = 2;
		if (!isNumber(deep)) {
			target = deep;
			deep = -1;
			i = 1;
		}
		if (!target) {
			target = {};
		}
		while (i < len) {
			if (typeOfObject(args[i])) {
				target = ExtendObject(target, args[i], deep);
			}
			i++;
		}
		return target;
	};

	/**
	 * 复制对象或数组
	 * @param   {Object|Array}  obj  [需要复制的对象]
	 * @return  {Object}             [复制后的对象]
	 */
	UTIL.copy = function(obj) {
		var ret;
		if (isArray(obj)) {
			ret = obj.slice(0);
		}
		else if (isObject(obj)) {
			ret = this.extend({}, obj);
		}
		else {
			ret = obj;
		}
		return ret;
	}

	/**
	 * 字符串首字母大写
	 */
	UTIL.ucFirst = function(str) {
		if (!isString(str)) {
			return str;
		}
		var first = str.charAt(0).toUpperCase();
		return first + str.substr(1);
	}

	/**
	 * 多语言翻译函数，翻译规则为全局的T函数(UTIL外实现)
	 * @type  {Function}
	 */
	UTIL.TRANSLATE = !UTIL.isFunc(WIN.T) ? function() {
		return UTIL.templateReplace.apply(this, arguments);
	} : WIN.T;


	// ********** vm ************

	/**
	 * 去掉字符串中所有空格
	 * @param   {String}  string
	 * @return  {String}
	 */
	UTIL.removeSpace = function(string) {
		return string.replace(/\s/g, '');
	}

	/**
	 * 拆解字符键值对，返回键和值
	 * @param   {String}         expression
	 * @param   {Boolean}        both          [是否返回键和值]
	 * @return  {String|Array}
	 */
	UTIL.getStringKeyValue = function(expression, both) {
		var array = expression.split(':');
		return both ? array : array.pop();
	}

	/**
	 * 分解字符串函数参数
	 * @param   {String}  expression
	 * @return  {Array}
	 */
	UTIL.stringToParameters = function(expression) {
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
	UTIL.jsonStringToArray = function(jsonString) {
		var ret = [], props, leng = jsonString.length;

		if (jsonString.charAt(0) === '{' && jsonString.charAt(leng - 1) === '}') {
			props = jsonString.substr(1, leng - 2).match(/[^,]+:[^:]+((?=,[\w_-]+:)|$)/g);
			util.each(props, function(prop) {
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
	 * 返回一个空文档碎片
	 * @return  {Fragment}
	 */
	UTIL.createFragment = function() {
		return DOC.createDocumentFragment();
	}

	/**
	 * DOMElement转换成文档片段
	 * @param   {DOMElement}  element
	 */
	UTIL.nodeToFragment = function(element) {
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
	UTIL.stringToFragment = function(html) {
		var div, fragment;

		// 存在标签
		if (/<[^>]+>/g.test(html)) {
			div = DOC.createElement('div');
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


	return UTIL;
});