var OP = Object.prototype;
var hasOwn = OP.hasOwnProperty;

/**
 * 是否是对象
 */
function isObject (object) {
	return OP.toString.call(object) === '[object Object]';
}

/**
 * 是否是数组
 */
function isArray (array) {
	return Array.isArray(array);
}

/**
 * 是否是函数
 */
function isFunc (fn) {
	return fn instanceof Function;
}

/**
 * 是否是字符串
 */
function isString (str) {
	return typeof str === 'string';
}

/**
 * 是否是布尔值
 */
function isBool (bool) {
	return typeof bool === 'boolean';
}

/**
 * 是否是数字
 */
function isNumber (num) {
	return typeof num === 'number' && !isNaN(num);
}

/**
 * 是否是纯粹对象
 */
function isPlainObject (obj) {
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
function isEmpty (object) {
	return Object.keys(object).length === 0;
}


var util = {
	isBool,
	isFunc,
	isArray,
	isEmpty,
	isNumber,
	isObject,
	isString
}

/**
 * 打印警告信息
 */
util.warn = function () {
	console.warn.apply(console, arguments);
}

/**
 * 打印错误信息
 */
util.error = function () {
	console.error.apply(console, arguments);
}

/*
 * 对象自有属性检测
 */
util.hasOwn = function (obj, key) {
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
util.def = function (object, property, value, writable, enumerable, configurable) {
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
util.defRec = function (object, property, value) {
	return this.def(object, property, value, true, false, true);
}

/**
 * 删除 object 所有属性
 * @param   {Object}   object
 */
util.clear = function (object) {
	this.each(object, function () {
		return null;
	});
}

/**
 * 遍历数组或对象，提供删除选项和退出遍历的功能
 * @param  {Array|Object}  items     [数组或对象]
 * @param  {Fuction}       callback  [回调函数]
 * @param  {Object}        context   [作用域]
 */
util.each = function (items, callback, context) {
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
			if (!this.hasOwn(items, i)) {
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
util.extend = function () {
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
					target[name] = this.extend(deep, clone, copy);
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
util.copy = function (target) {
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
util.removeSpace = function (string) {
	return string.replace(/\s/g, '');
}

/**
 * 拆解字符键值对，返回键和值
 * @param   {String}        expression
 * @param   {Boolean}       both         [是否返回键和值]
 * @return  {String|Array}
 */
util.getKeyValue = function (expression, both) {
	var array = expression.split(':');
	return both ? array : array.pop();
}

/**
 * 创建一个空的 dom 元素
 * @param   {String}     tag  [元素标签名称]
 * @return  {DOMElemnt}
 */
util.createElement = function (tag) {
	return document.createElement(tag);
}

/**
 * 返回一个空文档碎片
 * @return  {Fragment}
 */
util.createFragment = function () {
	return document.createDocumentFragment();
}

/**
 * element 的子节点转换成文档片段（element 将会被清空）
 * @param   {DOMElement}  element
 */
util.nodeToFragment = function (element) {
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
util.stringToFragment = function (html) {
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
util.getExpAlias = function (expression) {
	var pos = expression.indexOf('.');
	return pos === -1 ? expression : expression.substr(0, pos);
}

/**
 * 获取指令表达式的取值字段，无返回空
 * eg. item.text -> text,
 * @param   {String}  expression
 * @return  {String}
 */
util.getExpKey = function (expression) {
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
util.diff = function (newObject, oldObject) {
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
util.getUnique = function (contrastObject, referObject) {
	var unique = {};

	this.each(contrastObject, function (value, key) {
		var diff, oldItem = referObject[key];

		if (isObject(value)) {
			diff = this.getUnique(value, oldItem);
			if (!isEmpty(diff)) {
				unique[key] = diff;
			}
		}
		else if (isArray(value)) {
			var newArray = [];

			this.each(value, function (nItem, index) {
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
util.makePaths = function (access) {
	var length, paths = access && access.split('*');

	if (!paths || paths.length < 2) {
		return [];
	}

	for (var i = paths.length - 1; i > -1; i--) {
		if (this.isNumber(+paths[i])) {
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
util.getDeepValue = function (target, paths) {
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
util.makeScopePaths = function (paths) {
	var index = 0, scopePaths = [];

	if (paths.length % 2 === 0) {
		while (index < paths.length) {
			index += 2;
			scopePaths.push(paths.slice(0, index));
		}
	}

	return scopePaths;
}

export default util;
