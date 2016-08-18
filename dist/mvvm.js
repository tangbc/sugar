/*!
 * mvvm.js v1.2.0 (c) 2016 TANG
 * Released under the MIT license
 * Thu Aug 18 2016 11:33:31 GMT+0800 (CST)
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MVVM = factory());
}(this, function () { 'use strict';

	var OP = Object.prototype;
	var has = OP.hasOwnProperty;

	/**
	 * typeof 类型检测
	 * @param   {Mix}      test
	 * @param   {String}   type
	 * @return  {Boolean}
	 */
	function typeOf (test, type) {
		return typeof test === type;
	}

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
	function isFunc (func) {
		return typeOf(func, 'function');
	}

	/**
	 * 是否是字符串
	 */
	function isString (str) {
		return typeOf(str, 'string');
	}

	/**
	 * 是否是布尔值
	 */
	function isBool (bool) {
		return typeOf(bool, 'boolean');
	}

	/**
	 * 是否是数字
	 */
	function isNumber (num) {
		return typeOf(num, 'number') && !isNaN(num);
	}

	/**
	 * 是否是纯粹对象
	 */
	function isPlainObject (object) {
		if (!object || !isObject(object) || object.nodeType || object === object.window) {
			return false;
		}

		if (object.constructor && !has.call(object.constructor.prototype, 'isPrototypeOf')) {
			return false;
		}

		return true;
	}

	/**
	 * 是否是空对象
	 * @param   {Object}   object
	 * @return  {Boolean}
	 */
	function isEmptyObject (object) {
		return Object.keys(object).length === 0;
	}

	/**
	 * value 转成 Number 类型
	 * @param   {String|Mix}  value
	 * @return  {Number|Mix}
	 */
	function toNumber (value) {
		if (isString(value)) {
			var val = Number(value);
			return isNumber(val) ? val : value;
		} else {
			return value;
		}
	}

	/**
	 * 可选的数据格式化
	 * @param   {String}   value
	 * @param   {Boolean}  convertToNumber
	 * @return  {Number}
	 */
	function formatValue (value, convertToNumber) {
		return convertToNumber ? toNumber(value) : value;
	}

	var cons = window.console;

	/**
	 * 打印警告信息
	 */
	/* istanbul ignore next */
	function warn () {
		if (cons) {
			cons.warn.apply(cons, arguments);
		}
	}

	/**
	 * 打印错误信息
	 */
	/* istanbul ignore next */
	function error () {
		if (cons) {
			cons.error.apply(cons, arguments);
		}
	}

	/*
	 * 对象自有属性检测
	 */
	function hasOwn (obj, key) {
		return obj && has.call(obj, key);
	}

	/**
	 * object 定义或修改 property 属性
	 * @param   {Object}   object        [对象]
	 * @param   {String}   property      [属性字段]
	 * @param   {Mix}      value         [属性的修改值/新值]
	 * @param   {Boolean}  writable      [属性是否能被赋值运算符改变]
	 * @param   {Boolean}  enumerable    [属性是否出现在枚举中]
	 * @param   {Boolean}  configurable  [属性是否能够被改变或删除]
	 */
	function def (object, property, value, writable, enumerable, configurable) {
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
	function defRec (object, property, value) {
		return def(object, property, value, true, false, true);
	}

	/**
	 * 遍历数组或对象，提供删除选项和退出遍历的功能
	 * @param  {Array|Object}  iterator  [数组或对象]
	 * @param  {Fuction}       callback  [回调函数]
	 * @param  {Object}        context   [作用域]
	 */
	function each (iterator, callback, context) {
		var i, ret;

		if (!context) {
			context = this;
		}

		// 数组
		if (isArray(iterator)) {
			for (i = 0; i < iterator.length; i++) {
				ret = callback.call(context, iterator[i], i, iterator);

				// 回调返回 false 退出循环
				if (ret === false) {
					break;
				}

				// 回调返回 null 从原数组删除当前选项
				if (ret === null) {
					iterator.splice(i, 1);
					i--;
				}
			}

		} else if (isObject(iterator)) {
			var keys = Object.keys(iterator);

			for (i = 0; i < keys.length; i++) {
				var key = keys[i];

				ret = callback.call(context, iterator[key], key, iterator);

				// 回调返回 false 退出循环
				if (ret === false) {
					break;
				}

				// 回调返回 null 从原对象删除当前选项
				if (ret === null) {
					delete iterator[key];
				}
			}
		}
	}

	/**
	 * 删除 object 所有属性
	 * @param   {Object}   object
	 */
	function clearObject (object) {
		each(object, function () {
			return null;
		});
	}

	/**
	 * 扩展合并对象，摘自 jQuery
	 */
	function extend () {
		var arguments$1 = arguments;

		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

		// Handle a deep copy situation
		if (isBool(target)) {
			deep = target;
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== 'object' && !isFunc(target)) {
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

						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);
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
	 * 复制对象或数组，其他类型原样返回
	 * @param   {Object|Array}  target
	 * @return  {Mix}
	 */
	function copy (target) {
		var ret;

		if (isArray(target)) {
			ret = target.slice(0);
		} else if (isObject(target)) {
			ret = extend(true, {}, target);
		}

		return ret || target;
	}

	/**
	 * 拆解字符键值对，返回键值数组
	 * @param   {String}        expression
	 * @param   {Boolean}       both
	 * @return  {String|Array}
	 */
	function getKeyValue (expression, both) {
		var array = expression.split(':');
		return both ? array : array.pop();
	}


	/**
	 * 创建一个空的 dom 元素
	 * @param   {String}  tag  [元素标签名称]
	 * @return  {Elemnt}
	 */
	function createElement (tag) {
		return document.createElement(tag);
	}

	/**
	 * 返回一个空文档碎片
	 * @return  {Fragment}
	 */
	function createFragment () {
		return document.createDocumentFragment();
	}

	/**
	 * element 的子节点转换成文档片段（element 将会被清空）
	 * @param  {Element}  element
	 */
	function nodeToFragment (element) {
		var child;
		var fragment = createFragment();

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
	function stringToFragment (html) {
		var fragment;

		// 存在标签
		if (/<[^>]+>/g.test(html)) {
			var div = createElement('div');
			div.innerHTML = html;
			fragment = nodeToFragment(div);
		}
		// 纯文本节点
		else {
			fragment = createFragment();
			fragment.appendChild(document.createTextNode(html));
		}

		return fragment;
	}

	/**
	 * 去掉字符串中所有空格
	 * @param   {String}  string
	 * @return  {String}
	 */
	var regSpaceAll = /\s/g;
	function removeSpace (string) {
		return string.replace(regSpaceAll, '');
	}

	/**
	 * 返回 contrastObject 相对于 referObject 的差异对象
	 * @param   {Object}  contrastObject  [对比对象]
	 * @param   {Object}  referObject     [参照对象]
	 * @return  {Object}
	 */
	function getUniqueObject (contrastObject, referObject) {
		var unique = {};

		each(contrastObject, function (value, key) {
			var _diff, oldItem = referObject[key];

			if (isObject(value)) {
				_diff = getUniqueObject(value, oldItem);
				if (!isEmptyObject(_diff)) {
					unique[key] = _diff;
				}
			} else if (isArray(value)) {
				var newArray = [];

				each(value, function (nItem, index) {
					var _diff;

					if (isObject(nItem)) {
						_diff = getUniqueObject(nItem, oldItem[index]);
						newArray.push(_diff);
					}
					else {
						// 新数组元素
						if (oldItem.indexOf(nItem) < 0) {
							newArray.push(nItem);
						}
					}
				});

				unique[key] = newArray;
			} else {
				if (value !== oldItem) {
					unique[key] = value;
				}
			}
		});

		return unique;
	}

	/**
	 * 返回 contrastArray 相对于 referArray 的差异数组
	 * @param   {Array}  contrastArray  [对比数组]
	 * @param   {Array}  referArray     [参照数组]
	 * @return  {Array}
	 */
	function getUniqueArray (contrastArray, referArray) {
		var uniques = [];

		if (!isArray(contrastArray) || !isArray(referArray)) {
			return contrastArray;
		}

		each(contrastArray, function (item) {
			if (referArray.indexOf(item) < 0) {
				uniques.push(item);
			}
		});

		return uniques;
	}

	/**
	 * 返回两个比较值的差异
	 * 用于获取 v-bind 绑定 object 的更新差异
	 * @param   {Object|Array}  newTarget
	 * @param   {Object|Array}  oldTarget
	 * @return  {Object}
	 */
	function diff (newTarget, oldTarget) {
		var isA = isArray(newTarget) && isArray(oldTarget);
		var isO = isObject(newTarget) && isObject(oldTarget);
		var handler = isO ? getUniqueObject : (isA ? getUniqueArray : null);

		var after = handler && handler(newTarget, oldTarget) || newTarget;
		var before = handler && handler(oldTarget, newTarget) || oldTarget;

		return { after: after, before: before };
	}

	var guid = 0;

	/**
	 * 依赖收集模块
	 * @param  {String}  key  [依赖数据字段]
	 */
	function Depend (key) {
		this.key = key;
		this.watchers = [];
		this.guid = guid++;
	}

	/**
	 * 当前收集依赖的订阅模块 watcher
	 * @type  {Object}
	 */
	Depend.watcher = null;

	var dp = Depend.prototype;

	/**
	 * 添加依赖订阅
	 * @param  {Object}  watcher
	 */
	dp.addWatcher = function (watcher) {
		this.watchers.push(watcher);
	}

	/**
	 * 移除依赖订阅
	 * @param  {Object}  watcher
	 */
	dp.removeWatcher = function (watcher) {
		var index = this.watchers.indexOf(watcher);
		if (index > -1) {
			this.watchers.splice(index, 1);
		}
	}

	/**
	 * 为 watcher 收集当前的依赖
	 */
	dp.depend = function () {
		if (Depend.watcher) {
			Depend.watcher.addDepend(this);
		}
	}

	/**
	 * 依赖变更前调用方法，用于旧数据的缓存处理
	 */
	dp.beforeNotify = function () {
		each(this.watchers, function (watcher) {
			watcher.beforeUpdate();
		});
	}

	/**
	 * 依赖变更，通知每一个订阅了该依赖的 watcher
	 * @param   {Object}  args  [数组操作参数信息]
	 */
	dp.notify = function (args) {
		var guid = this.guid;
		each(this.watchers, function (watcher) {
			watcher.update(args, guid);
		});
	}

	var INIT = 0;
	var IDENT = 1;
	var QUOTE = 2;
	var OTHER = 1;

	function ident (value) {
		return value;
	}

	function quote (value) {
		return '';
	}

	var convert = [0, ident, quote, ident];

	/**
	 * 获取字符类型
	 * 这里只定义了普通取词的分割法
	 * @param   {String}  cha
	 * @return  {Number}
	 */
	function getState (cha) {
		var code = cha.charCodeAt(0);

		// a-z A-Z 0-9
		if (
			(code >= 0x41 && code <= 0x5A) ||
			(code >= 0x61 && code <= 0x7A) ||
			(code >= 0x30 && code <= 0x39)
		) {
			return IDENT;
		}

		switch (code) {
			case 0x5B: // [
			case 0x5D: // ]
			case 0x2E: // .
			case 0x22: // "
			case 0x27: // '
				return QUOTE;
			default:
				return OTHER; // @todo
		}
	}

	/**
	 * 取词状态机
	 * @type  {Object}
	 */
	var StateMachine = {
		/**
		 * 初始状态设定
		 */
		init: function (state) {
			this.saves = '';
			this.state = state;
		},

		/**
		 * 设置状态并返回当前取词
		 * @param  {Number}  state
		 * @param  {String}  value
		 */
		set: function (state, value) {
			var ref = this.get(state);
			var keepIdent = ref.keepIdent;
			var tobeQuote = ref.tobeQuote;
			var keepQuote = ref.keepQuote;
			var tobeIdent = ref.tobeIdent;

			if (keepIdent) {
				this.save(state, value);
			} else if (tobeQuote) {
				var saves = this.saves;
				this.saves = '';
				this.change(state);
				return saves;
			} else if (keepQuote) {
				// to do nothing
			} else if (tobeIdent) {
				this.save(state, value);
				this.change(state);
			}
		},

		/**
		 * 获取状态变更类型
		 * @param   {Number}  toBecome  [将要转换的状态]
		 * @return  {Object}            [状态类型对象]
		 */
		get: function (toBecome) {
			var current = this.state;
			var keepIdent = current === IDENT && toBecome === IDENT;
			var tobeQuote = (current === IDENT || current === INIT) && toBecome === QUOTE;
			var keepQuote = current === QUOTE && toBecome === QUOTE;
			var tobeIdent = (current === QUOTE || current === INIT) && toBecome === IDENT;
			return { keepIdent: keepIdent, tobeQuote: tobeQuote, keepQuote: keepQuote, tobeIdent: tobeIdent };
		},

		/**
		 * 更改状态
		 * @param   {Number}  state
		 */
		change: function (state) {
			this.state = state;
		},

		/**
		 * 缓存当前字符
		 */
		save: function (state, value) {
			this.saves += convert[state](value);
		},

		/**
		 * 重置状态
		 */
		reset: function () {
			this.saves = '';
			this.state = INIT;
		}
	}

	/**
	 * 将字符表达式解析成访问路径
	 * @param   {String}  expression
	 * @return  {Array}
	 */
	function parseToPath (expression) {
		var paths = [];
		var letters = expression.split('');
		var lastIndex = letters.length - 1;
		var firstState = getState(letters[0]);

		StateMachine.init(firstState);
		each(letters, function (letter, index) {
			var state = getState(letter);
			var word = StateMachine.set(state, letter);
			if (word) {
				paths.push(word);
			}

			// 解析结束
			if (index === lastIndex && StateMachine.saves) {
				paths.push(StateMachine.saves);
				StateMachine.reset();
			}
		});

		return paths;
	}

	/**
	 * 通过访问层级取值
	 * @param   {Object}  target
	 * @param   {Array}   paths
	 * @return  {Object}
	 */
	function getDeepValue (target, paths) {
		while (paths.length) {
			target = target[paths.shift()];
		}
		return target;
	}


	/**
	 * 生成访问路径数组
	 * @param   {String}  expression
	 * @return  {Array}
	 */
	function createPath (expression) {
		return parseToPath(removeSpace(expression));
	}

	/**
	 * 根据访问路径设置对象指定字段值
	 * @param  {Object}  scope
	 * @param  {Mix}     value
	 * @param  {Array}   paths
	 */
	function setValueByPath (scope, value, paths) {
		var copyPaths = copy(paths);
		var set = copyPaths.pop();
		var data = getDeepValue(scope, copyPaths);

		if (data) {
			data[set] = value;
		}
	}

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

	// 表达式中允许的关键字
	var allowKeywords = 'Math.parseInt.parseFloat.Date.this.true.false.null.undefined.Infinity.NaN.isNaN.isFinite.decodeURI.decodeURIComponent.encodeURI.encodeURIComponent';
	var regAllowKeyword = new RegExp('^(' + allowKeywords.replace(/\./g, '\\b|') + '\\b)');

	// 表达式中禁止的关键字
	var avoidKeywords = 'var.const.let.if.else.for.in.continue.switch.case.break.default.function.return.do.while.delete.try.catch.throw.finally.with.import.export.instanceof.yield.await';
	var regAviodKeyword = new RegExp('^(' + avoidKeywords.replace(/\./g, '\\b|') + '\\b)');


	// 保存常量，返回序号 "i"
	var consts = [];
	function saveConst (string) {
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
	function returnConst (string, i) {
		return consts[i];
	}

	/**
	 * 返回变量/单词的 scope 替换
	 * @param   {String}  string
	 * @return  {String}
	 */
	function replaceScope (string) {
		var pad = string.charAt(0);
		var path = string.slice(1);

		if (regAllowKeyword.test(path)) {
			return string;
		} else {
			path = path.indexOf('"') > -1 ? path.replace(regSaveConst, returnConst) : path;
			return pad + 'scope.' + path;
		}
	}

	/**
	 * 是否是常规指令表达式
	 * @param   {String}   expression
	 * @return  {Boolean}
	 */
	function isNormal (expression) {
		return regNormal.test(expression) && !regBool.test(expression) && expression.indexOf('Math.') !== 0;
	}

	/**
	 * 表达式变量添加 scope
	 * @return  {String}
	 */
	function addScope (expression) {
		if (isNormal(expression)) {
			return 'scope.' + expression;
		}

		expression = (' ' + expression).replace(regReplaceConst, saveConst);
		expression = expression.replace(regReplaceScope, replaceScope);
		expression = expression.replace(regSaveConst, returnConst);

		return expression;
	}

	/**
	 * 空操作取值函数
	 */
	function noop () {}

	/**
	 * 生成表达式取值函数
	 * @param   {String}    expression
	 * @return  {Function}
	 */
	function createGetter (expression) {
		if (regAviodKeyword.test(expression)) {
			warn('Avoid using unallow keyword in expression ['+ expression +']');
			return noop;
		}

		try {
			return new Function('scope', 'return ' + addScope(expression) + ';');
		} catch (e) {
			error('Invalid generated expression: [' + expression + ']');
			return noop;
		}
	}

	/**
	 * 生成表达式设值函数
	 * @param   {String}  expression
	 */
	function createSetter (expression) {
		var paths = createPath(expression);
		if (paths.length) {
			return function setter (scope, value) {
				setValueByPath(scope, value, paths);
			}
		} else {
			error('Invalid setter expression ['+ expression +']');
			return noop;
		}
	}

	/**
	 * 遍历对象/数组每一个可枚举属性
	 * @param   {Object|Array}  target  [遍历值]
	 * @param   {Boolean}       root    [是否是根对象/数组]
	 */
	var walkeds = [];
	function walkThrough (target, root) {
		var ob = target && target.__ob__;
		var guid = ob && ob.dep.guid;

		if (guid) {
			if (walkeds.indexOf(guid) > -1) {
				return;
			} else {
				walkeds.push(guid);
			}
		}

		each(target, function (value) {
			walkThrough(value, false);
		});

		if (root) {
			walkeds.length = 0;
		}
	}

	/**
	 * 数据订阅模块
	 * @param  {Object}    vm
	 * @param  {Object}    desc
	 * @param  {Function}  callback
	 * @param  {Object}    context
	 */
	function Watcher (vm, desc, callback, context) {
		this.vm = vm;
		extend(this, desc);
		this.callback = callback;
		this.context = context || this;

		// 依赖 id 缓存
		this.depIds = [];
		this.newDepIds = [];
		this.shallowIds = [];
		// 依赖实例缓存
		this.depends = [];
		this.newDepends = [];

		var expression = desc.expression;
		// 缓存取值函数
		this.getter = createGetter(expression);
		// 缓存设值函数（双向数据绑定）
		this.setter = desc.duplex ? createSetter(expression) : null;

		// 缓存表达式旧值
		this.oldValue = null;
		// 表达式初始值 & 提取依赖
		this.value = this.get();
	}

	var wp = Watcher.prototype;

	/**
	 * 获取取值域
	 * @return  {Object}
	 */
	wp.getScope = function () {
		return this.context.$scope || this.vm.$data;
	}

	/**
	 * 获取表达式的取值
	 */
	wp.getValue = function () {
		var scope = this.getScope();
		return this.getter.call(scope, scope);
	}

	/**
	 * 设置订阅数据的值
	 * @param  {Mix}  value
	 */
	wp.setValue = function (value) {
		var scope = this.getScope();
		if (this.setter) {
			this.setter.call(scope, scope, value);
		}
	}

	/**
	 * 获取表达式的取值 & 提取依赖
	 */
	wp.get = function () {
		var value;
		this.beforeGet();

		value = this.getValue();

		// 深层依赖获取
		if (this.deep) {
			// 先缓存浅依赖的 ids
			this.shallowIds = copy(this.newDepIds);
			walkThrough(value, true);
		}

		this.afterGet();
		return value;
	}

	/**
	 * 设置当前依赖对象
	 */
	wp.beforeGet = function () {
		Depend.watcher = this;
	}

	/**
	 * 将依赖订阅到该 watcher
	 */
	wp.addDepend = function (depend) {
		var guid = depend.guid;
		var newIds = this.newDepIds;

		if (newIds.indexOf(guid) < 0) {
			newIds.push(guid);
			this.newDepends.push(depend);
			if (this.depIds.indexOf(guid) < 0) {
				depend.addWatcher(this);
			}
		}
	}

	/**
	 * 移除订阅的依赖监测
	 * @param   {Function}  filter
	 */
	wp.removeDepends = function (filter) {
		each(this.depends, function (depend) {
			if (filter) {
				if (filter.call(this, depend)) {
					depend.removeWatcher(this);
				}
			} else {
				depend.removeWatcher(this);
			}
		}, this);
	}

	/**
	 * 更新/解除依赖挂载
	 */
	wp.afterGet = function () {
		Depend.watcher = null;

		// 清除无用的依赖
		this.removeDepends(function (depend) {
			return this.newDepIds.indexOf(depend.guid) < 0;
		});

		// 重设依赖缓存
		this.depIds = copy(this.newDepIds);
		this.newDepIds.length = 0;

		this.depends = copy(this.newDepends);
		this.newDepends.length = 0;
	}

	/**
	 * 更新前调用方法
	 * 用于旧值的缓存处理，对象或数组只存副本
	 */
	wp.beforeUpdate = function () {
		this.oldValue = copy(this.value);
	}

	/**
	 * 依赖变化，更新取值
	 * @param   {Object}  args  [数组操作参数信息]
	 * @param   {Number}  guid  [变更的依赖对象 id]
	 */
	wp.update = function (args, guid) {
		var oldValue = this.oldValue;
		var newValue = this.value = this.get();

		if (oldValue !== newValue) {
			var fromDeep = this.deep && this.shallowIds.indexOf(guid) < 0;
			this.callback.call(this.context, newValue, oldValue, args, fromDeep);
		}
	}

	/**
	 * 销毁函数
	 */
	wp.destory = function () {
		this.value = null;
		this.removeDepends();
		this.getter = this.setter = null;
		this.vm = this.callback = this.context = null;
	}

	/**
	 * 指令通用构造函数
	 * 提供生成数据订阅和变化更新功能
	 * @param  {Object}   parser  [解析模块实例]
	 */
	function Directive (parser) {
		this.parser = parser;
		this.$scope = parser.$scope;
	}

	var dp$1 = Directive.prototype;

	/**
	 * 安装/解析指令，订阅数据、更新视图
	 */
	dp$1.install = function () {
		var parser = this.parser;
		// 生成数据订阅实例
		var watcher = this.watcher = new Watcher(parser.vm, parser.desc, this.update, this);
		// 更新初始视图
		this.update(watcher.value);
	}

	/**
	 * 销毁/卸载指令
	 */
	dp$1.uninstall = function () {
		this.watcher.destory();
		this.parser = this.$scope = null;
	}

	/**
	 * 更新指令视图
	 * @param   {Mix}     newValue  [依赖数据新值]
	 * @param   {Mix}     oldVlaue  [依赖数据旧值]
	 * @param   {Object}  args      [数组操作参数信息]
	 */
	dp$1.update = function (newValue, oldVlaue, args) {
		var parser = this.parser;
		parser.update.call(parser, newValue, oldVlaue, args);
	}

	/**
	 * 获取依赖数据当前值
	 * @return  {Mix}
	 */
	dp$1.get = function () {
		return this.watcher.value;
	}

	/**
	 * 设置依赖数据的值（用于双向数据绑定）
	 * @param  {Mix}  value
	 */
	dp$1.set = function (value) {
		this.watcher.setValue(value);
	}

	/**
	 * Parser 基础解析器模块，指令解析模块都继承于 Parser
	 * @param  {Object}   vm
	 * @param  {Element}  node
	 * @param  {Object}   desc
	 * @param  {Object}   scope
	 */
	function Parser (vm, node, desc, scope) {
		// 数据缓存
		this.vm = vm;
		this.el = node;
		this.desc = desc;
		this.$scope = scope;

		this.parse();
	}

	var pp = Parser.prototype;

	/**
	 * 绑定一个指令实例
	 */
	pp.bind = function () {
		var dir = this.directive = new Directive(this);
		dir.install();
	}

	/**
	 * 指令销毁函数
	 */
	pp.destroy = function () {
		var directive = this.directive;

		// 有些指令没有实例化 Directive
		// 所以需要调用额外定义的销毁函数
		if (directive) {
			directive.uninstall();
		} else if (this._destroy) {
			this._destroy();
		}

		this.vm = this.desc = this.$scope = null;
	}


	/**
	 * 解析模块的类式继承
	 * @param   {Function}   PreParser
	 * @return  {Prototype}
	 */
	function linkParser (PreParser) {
		return PreParser.prototype = Object.create(Parser.prototype);
	}

	/**
	 * 是否是元素节点
	 * @param   {DOMElement}   element
	 * @return  {Boolean}
	 */
	function isElement (element) {
		return element.nodeType === 1;
	}

	/**
	 * 是否是文本节点
	 * @param   {DOMElement}   element
	 * @return  {Boolean}
	 */
	function isTextNode (element) {
		return element.nodeType === 3;
	}

	/**
	 * 清空 element 的所有子节点
	 * @param   {DOMElement}  element
	 */
	function empty (element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
		return element;
	}

	/**
	 * 获取节点属性值
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @return  {String}
	 */
	function getAttr (node, name) {
		return node.getAttribute(name) || '';
	}

	/**
	 * 移除节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 */
	function removeAttr (node, name) {
		node.removeAttribute(name);
	}

	/**
	 * 设置节点属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @param   {String}      value
	 */
	function setAttr (node, name, value) {
		if (typeof value === 'boolean') {
			node[name] = value;
		} else if (value === null) {
			removeAttr(node, name);
		} else if (value !== getAttr(node, name)) {
			node.setAttribute(name, value);
		}
	}

	/**
	 * 判断节点是否存在属性
	 * @param   {DOMElement}  node
	 * @param   {String}      name
	 * @return  {Boolean}
	 */
	function hasAttr (node, name) {
		return node.hasAttribute(name);
	}

	/**
	 * 节点是否存在 classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 * @return {Boolean}
	 */
	function hasClass (node, classname) {
		var current, list = node.classList;

		/* istanbul ignore else */
		if (list) {
			return list.contains(classname);
		} else {
			current = ' ' + getAttr(node, 'class') + ' ';
			return current.indexOf(' ' + classname + ' ') > -1;
		}
	}

	/**
	 * 节点添加 classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 */
	function addClass (node, classname) {
		var current, list = node.classList;

		if (!classname || hasClass(node, classname)) {
			return;
		}

		/* istanbul ignore else */
		if (list) {
			list.add(classname);
		} else {
			current = ' ' + getAttr(node, 'class') + ' ';

			if (current.indexOf(' ' + classname + ' ') === -1) {
				setAttr(node, 'class', (current + classname).trim());
			}
		}
	}

	/**
	 * 节点删除 classname
	 * @param  {DOMElement}  node
	 * @param  {String}      classname
	 */
	function removeClass (node, classname) {
		var current, target, list = node.classList;

		if (!classname || !hasClass(node, classname)) {
			return;
		}

		/* istanbul ignore else */
		if (list) {
			list.remove(classname);
		} else {
			target = ' ' + classname + ' ';
			current = ' ' + getAttr(node, 'class') + ' ';

			while (current.indexOf(target) > -1) {
				current = current.replace(target, ' ');
			}

			setAttr(node, 'class', current.trim());
		}

		if (!node.className) {
			removeAttr(node, 'class');
		}
	}

	/**
	 * 节点事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	function addEvent (node, evt, callback, capture) {
		node.addEventListener(evt, callback, capture);
	}

	/**
	 * 解除节点事件绑定
	 * @param   {DOMElement}   node
	 * @param   {String}       evt
	 * @param   {Function}     callback
	 * @param   {Boolean}      capture
	 */
	function removeEvent (node, evt, callback, capture) {
		node.removeEventListener(evt, callback, capture);
	}

	/**
	 * 获取节点的下一个兄弟元素节点
	 * @param  {Element}  node
	 */
	function getNextElement (node) {
		var el = node.nextSibling;

		if (el && isElement(el)) {
			return el;
		}

		while (el) {
			el = el.nextSibling;

			if (el && isElement(el)) {
				return el;
			}
		}

		return null;
	}

	var regBigBrackets = /^\{.*\}$/;
	var regSmallBrackets = /(\(.*\))/;
	var regQuotes = /(^'*)|('*$)|(^"*)|("*$)/g;
	var regJsonFormat = /[^,]+:[^:]+((?=,[^:]+:)|$)/g;

	/**
	 * 分解字符串函数参数
	 * @param   {String}  funcString
	 * @return  {Object}
	 */
	function stringToParams (funcString) {
		var args, func;
		var exp = removeSpace(funcString);
		var matches = exp.match(regSmallBrackets);
		var result = matches && matches[0];

		// 有函数名和参数
		if (result) {
			func = exp.substr(0, exp.indexOf(result));
			args = '[' + result.substr(1, result.length - 2) + ']';
		} else {
			func = exp;
		}

		return { func: func, args: args };
	}

	/**
	 * 字符串 json 转为键值对象
	 * @param   {String}  jsonString
	 * @return  {Object}
	 */
	function convertJson (jsonString) {
		var json = {}, string = jsonString.trim();

		if (regBigBrackets.test(string)) {
			var leng = string.length;
			string = string.substr(1, leng - 2).replace(/\s/g, '');
			var props = string.match(regJsonFormat);

			each(props, function (prop) {
				var vals = getKeyValue(prop, true);
				var name = vals[0], value = vals[1];
				if (name && value) {
					name = name.replace(regQuotes, '');
					json[name] = value;
				}
			});
		}

		return json;
	}

	/**
	 * 格式化事件信息
	 * @param   {String}  arg
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	function formatEvent (arg, expression) {
		var pos = arg.indexOf('.');

		var type, dress = '';
		if (pos > -1) {
			type = arg.substr(0, pos);
			dress = arg.substr(pos + 1,  arg.length);
		} else {
			type = arg;
		}

		var info = stringToParams(expression);
		var func = info.func, args = info.args;

		return { type: type, dress: dress, func: func, args: args };
	}

	/**
	 * 收集绑定的事件
	 * @param   {Object}  desc
	 * @return  {Array}
	 */
	function collectEvents (desc) {
		var binds = [];
		var args = desc.args;
		var expression = desc.expression;

		if (args) {
			binds.push(formatEvent(args, expression));
		} else {
			var json = convertJson(expression);
			each(json, function (value, key) {
				binds.push(formatEvent(key, value));
			});
		}

		return binds;
	}

	/**
	 * 获取事件修饰符对象
	 * 支持 4 种事件修饰符 .self .stop .prevent .capture
	 * @param   {String}  type
	 * @param   {String}  dress
	 */
	function getDress (type, dress) {
		var self = dress.indexOf('self') > -1;
		var stop = dress.indexOf('stop') > -1;
		var prevent = dress.indexOf('prevent') > -1;
		var capture = dress.indexOf('capture') > -1;
		var keyCode = type.indexOf('key') === 0 ? +dress : null;
		return { self: self, stop: stop, prevent: prevent, capture: capture, keyCode: keyCode }
	}


	/**
	 * v-on 指令解析模块
	 * 不需要实例化 Directive
	 */
	function VOn () {
		this.guid = 1000;
		this.agents = {};
		this.funcWatchers = [];
		this.argsWatchers = [];
		Parser.apply(this, arguments);
	}

	var von = linkParser(VOn);

	/**
	 * 解析 v-on 指令
	 */
	von.parse = function () {
		each(collectEvents(this.desc), function (bind) {
			this.parseEvent(bind);
		}, this);
	}

	/**
	 * 获取事件/参数的监测信息
	 * @param   {String}  expression
	 * @return  {Object}
	 */
	von.getExpDesc = function (expression) {
		return extend({}, this.desc, {
			'expression': expression
		});
	}

	/**
	 * 解析事件处理函数
	 * @param   {Object}  bind
	 */
	von.parseEvent = function (bind) {
		var args = bind.args;
		var type = bind.type;
		var dress = bind.dress;
		var capture = dress.indexOf('capture') > -1;
		var desc = this.getExpDesc(bind.func);

		var funcWatcher = new Watcher(this.vm, desc, function (newFunc, oldFunc) {
			this.off(type, oldFunc, capture);
			this.bindEvent(type, dress, newFunc, args);
		}, this);

		this.bindEvent(type, dress, funcWatcher.value, args);

		// 缓存数据订阅对象
		this.funcWatchers.push(funcWatcher);
	}

	/**
	 * 添加一个事件绑定，同时处理参数的变更
	 * @param   {String}    type       [事件类型]
	 * @param   {String}    dress      [事件修饰符]
	 * @param   {Function}  func       [回调函数]
	 * @param   {String}    argString  [参数字符串]
	 */
	von.bindEvent = function (type, dress, func, argString) {
		var ref = getDress(type, dress);
		var self = ref.self;
		var stop = ref.stop;
		var prevent = ref.prevent;
		var capture = ref.capture;
		var keyCode = ref.keyCode;

		// 挂载 $event
		defRec((this.$scope || this.vm.$data), '$event', '__e__');

		// 处理回调参数以及依赖监测
		var args = [];
		if (argString) {
			var desc = this.getExpDesc(argString);
			var argsWatcher = new Watcher(this.vm, desc, function (newArgs) {
				args = newArgs;
			}, this);
			args = argsWatcher.value;
			this.argsWatchers.push(argsWatcher);
		}

		// 事件代理函数
		var el = this.el;
		var eventAgent = function _eventAgent (e) {
			// 是否限定只能在当前节点触发事件
			if (self && e.target !== el) {
				return;
			}

			// 是否指定按键触发
			if (keyCode && keyCode !== e.keyCode) {
				return;
			}

			// 未指定参数，则原生事件对象作为唯一参数
			if (!args.length) {
				args.push(e);
			} else {
				// 更新/替换事件对象
				each(args, function (param, index) {
					if (param === '__e__' || param instanceof Event) {
						args[index] = e;
					}
				});
			}

			// 是否阻止默认事件
			if (prevent) {
				e.preventDefault();
			}

			// 是否阻止冒泡
			if (stop) {
				e.stopPropagation();
			}

			func.apply(this, args);
		}

		var guid = this.guid++;
		func.guid = guid;
		this.agents[guid] = eventAgent;

		// 添加绑定
		this.on(type, eventAgent, capture);
	}

	/**
	 * 绑定一个事件
	 * @param   {String}    type
	 * @param   {Function}  callback
	 * @param   {Boolean}   capture
	 */
	von.on = function (type, callback, capture) {
		addEvent(this.el, type, callback, capture);
	}

	/**
	 * 解绑一个事件
	 * @param   {String}    type
	 * @param   {Function}  callback
	 * @param   {Boolean}   capture
	 */
	von.off = function (type, callback, capture) {
		var agents = this.agents;
		var guid = callback.guid;
		var eventAgent = agents[guid];

		if (eventAgent) {
			removeEvent(this.el, type, eventAgent, capture);
			delete agents[guid];
		}
	}

	/**
	 * von 指令特定的销毁函数
	 */
	von._destroy = function () {
		clearObject(this.agents);

		each(this.funcWatchers, function (watcher) {
			watcher.destory();
		});

		each(this.argsWatchers, function (watcher) {
			watcher.destory();
		});
	}

	/**
	 * v-el 指令解析模块
	 * 不需要实例化 Directive
	 */
	function VEl () {
		Parser.apply(this, arguments);
	}
	var vel = linkParser(VEl);

	/**
	 * 解析 v-el 指令
	 * 不需要在 model 中声明
	 */
	vel.parse = function () {
		// 不能在 vfor 中使用
		if (!this.$scope) {
			var register = this.desc.expression;
			this.vm.$data.$els[register] = this.el;
		} else {
			warn('v-el can not be used inside v-for!');
		}
	}

	/**
	 * 移除 DOM 注册的引用
	 * @param   {Object}      vm
	 * @param   {DOMElement}  element
	 */
	function removeDOMRegister (vm, element) {
		var registers = vm.$data.$els;
		var childNodes = element.childNodes;

		for (var i = 0; i < childNodes.length; i++) {
			var node = childNodes[i];

			if (!isElement(node)) {
				continue;
			}

			var nodeAttrs = node.attributes;

			for (var ii = 0; ii < nodeAttrs.length; ii++) {
				var attr = nodeAttrs[ii];

				if (
					attr.name === 'v-el' &&
					hasOwn(registers, attr.value)
				) {
					registers[attr.value] = null;
				}
			}

			if (node.hasChildNodes()) {
				removeDOMRegister(vm, node);
			}
		}
	}


	/**
	 * v-if 指令解析模块
	 */
	function VIf () {
		Parser.apply(this, arguments);
	}

	var vif = linkParser(VIf);

	/**
	 * 解析 v-if 指令
	 */
	vif.parse = function () {
		var el = this.el;

		// 缓存渲染内容
		this.elContent = el.innerHTML;
		empty(el);

		// else 节点
		var elseEl = getNextElement(el);
		if (
			elseEl &&
			(hasAttr(elseEl, 'v-else') || elseEl.__directive === 'v-else')
		) {
			this.elseEl = elseEl;
			this.elseElContent = elseEl.innerHTML;
			empty(elseEl);
		}

		this.bind();
	}

	/**
	 * 更新视图
	 * @param   {Boolean}  isRender
	 */
	vif.update = function (isRender) {
		this.toggle(this.el, this.elContent, isRender);

		var elseEl = this.elseEl;
		if (elseEl) {
			this.toggle(elseEl, this.elseElContent, !isRender);
		}
	}

	/**
	 * 切换节点内容渲染
	 */
	vif.toggle = function (node, content, isRender) {
		var vm = this.vm;
		var frag = stringToFragment(content);

		// 渲染
		if (isRender) {
			vm.complieElement(frag, true, this.$scope);
			node.appendChild(frag);
		}
		// 不渲染的情况需要移除 DOM 注册的引用
		else {
			empty(node);
			removeDOMRegister(vm, frag);
		}
	}

	// 重写数组操作方法
	var rewriteArrayMethods = [
		'pop',
		'push',
		'sort',
		'shift',
		'splice',
		'unshift',
		'reverse'
	];

	var arrayProto = Array.prototype;
	var arrayMethods = Object.create(arrayProto);

	/**
	 * 重写 array 操作方法
	 */
	each(rewriteArrayMethods, function (method) {
		var original = arrayProto[method];

		defRec(arrayMethods, method, function () {
			var arguments$1 = arguments;

			var args = [];
			var ob = this.__ob__;

			for (var i = 0; i < arguments.length; i++) {
				args.push(arguments$1[i]);
			}

			ob.dep.beforeNotify();

			var result = original.apply(this, args);

			var inserts;
			switch (method) {
				case 'push':
				case 'unshift':
					inserts = args;
					break;
				case 'splice':
					inserts = args.slice(2);
					break;
			}

			if (inserts && inserts.length) {
				ob.observeArray(inserts);
			}

			ob.dep.notify({method: method, args: args});

			return result;
		});
	});

	/**
	 * 添加 $set 方法
	 * 提供需要修改的数组项下标 index 和新值 value
	 */
	defRec(arrayMethods, '$set', function (index, value) {
		// 超出数组长度默认追加到最后
		if (index >= this.length) {
			index = this.length;
		}
		return this.splice(index, 1, value)[0];
	});

	/**
	 * 添加 $remove 方法
	 */
	defRec(arrayMethods, '$remove', function (item) {
		var index = this.indexOf(item);
		if (index > -1) {
			return this.splice(index, 1);
		}
	});

	/**
	 * 修改 array 的原型
	 * @param   {Array}  array
	 */
	function changeArrayProto (array) {
		array.__proto__ = arrayMethods;
	}


	/**
	 * 数据监测模块
	 * @param  {Object}  data  [监测对象/数组]
	 * @param  {String}  key   [监测字段名称]
	 */
	function Observer (data, key) {
		this.dep = new Depend(key);

		if (isArray(data)) {
			this.observeArray(data, key);
		} else {
			this.observeObject(data);
		}

		defRec(data, '__ob__', this);
	}


	/**
	 * 创建一个对象监测
	 * @param   {Object|Array}  target
	 * @param   {String}        key
	 * @return  {Object}
	 */
	function createObserver (target, key) {
		if (isObject(target) || isArray(target)) {
			return hasOwn(target, '__ob__') ? target.__ob__ : new Observer(target, key);
		}
	}

	/**
	 * 监测 object[key] 的变化 & 收集依赖
	 * @param   {Object}  object
	 * @param   {String}  key
	 * @param   {Mix}     value
	 */
	function observe (object, key, value) {
		var dep = new Depend(key);
		var descriptor = Object.getOwnPropertyDescriptor(object, key);
		var getter = descriptor && descriptor.get;
		var setter = descriptor && descriptor.set;

		var childOb = createObserver(value, key);

		Object.defineProperty(object, key, {
			get: function Getter () {
				var val = getter ? getter.call(object) : value;

				if (Depend.watcher) {
					dep.depend();
					if (childOb) {
						childOb.dep.depend();
					}
				}

				if (isArray(val)) {
					each(val, function (item) {
						var ob = item && item.__ob__;
						if (ob) {
							ob.dep.depend();
						}
					});
				}

				return val;
			},
			set: function Setter (newValue) {
				var oldValue = getter ? getter.call(object) : value;

				if (newValue === oldValue) {
					return;
				}

				dep.beforeNotify();

				if (setter) {
					setter.call(object, newValue);
				} else {
					value = newValue;
				}

				childOb = createObserver(newValue, key);
				dep.notify();
			}
		});
	}


	var op = Observer.prototype;

	/**
	 * 监测对象
	 * @param   {Object}  object
	 */
	op.observeObject = function (object) {
		each(object, function (value, key) {
			observe(object, key, value);
		});
	}

	/**
	 * 监测数组
	 * @param   {Array}   array
	 * @param   {String}  key
	 */
	op.observeArray = function (array, key) {
		changeArrayProto(array);
		each(array, function (item) {
			createObserver(item, key);
		});
	}

	var vforAlias = '__vfor__';
	var regForExp = /(.*) in (.*)/;
	var partlyMethods = 'push|pop|shift|unshift|splice'.split('|');

	/**
	 * 标记 vfor 节点特征字段
	 * @param   {Element}  node
	 * @param   {String}   feature  [特征字段]
	 * @param   {String}   value    [特征值]
	 */
	function markVforFeature (node, feature, value) {
		def(node, feature, value);
	}


	/**
	 * v-for 指令解析模块
	 */
	function VFor () {
		Parser.apply(this, arguments);
	}

	var vfor = linkParser(VFor);

	/**
	 * 解析 v-for 指令
	 */
	vfor.parse = function () {
		var el = this.el;
		var desc = this.desc;
		var parent = el.parentNode;
		var expression = desc.expression;
		var match = expression.match(regForExp);

		if (!match) {
			return warn('The format of v-for must be like "item in items"!');
		}

		var alias = match[1];
		var iterator = match[2];

		this.scopes = [];
		this.init = true;
		this.alias = alias;
		this.partly = false;
		this.partlyArgs = [];
		this.$parent = parent;
		this.$next = el.nextSibling;
		this.$prev = el.previousSibling;
		this.isOption = el.tagName === 'OPTION' && parent.tagName === 'SELECT';

		desc.expression = iterator;
		this.bind();
		this.updateModel();
	}

	/**
	 * 更新 select 绑定
	 */
	vfor.updateModel = function () {
		if (this.isOption) {
			var model = this.$parent.__vmodel__;
			if (model) {
				model.forceUpdate();
			}
		}
	}

	/**
	 * 更新视图
	 * @param   {Array}   newArray  [新数组]
	 * @param   {Array}   oldArray  [旧数组]
	 * @param   {Object}  arg       [数组操作参数信息]
	 */
	vfor.update = function (newArray, oldArray, arg) {
		// 初次构建列表
		if (this.init) {
			this.initList(newArray);
		} else {
			// 数组操作部分更新
			if (arg && partlyMethods.indexOf(arg.method) > -1) {
				this.updatePartly(newArray, arg);
			} else {
				this.recompileList(newArray);
			}
		}
	}

	/**
	 * 初始化构建列表
	 * @param   {Array}  list
	 */
	vfor.initList = function (list) {
		this.init = false;
		var listFragment = this.buildList(list);
		this.$parent.replaceChild(listFragment, this.el);
	}

	/**
	 * 数组操作部分更新列表
	 * @param   {Array}   list
	 * @param   {Object}  arg
	 */
	vfor.updatePartly = function (list, arg) {
		this.partly = true;

		var partlyArgs = [];
		var method = arg.method;
		var scopes = this.scopes;
		var args = copy(arg.args);

		// 更新处理 DOM 片段
		this[method].call(this, list, arg.args);

		switch (method) {
			case 'pop':
			case 'shift':
				break;
			case 'push':
			case 'unshift':
				partlyArgs = this.partlyArgs;
				break;
			case 'splice':
				partlyArgs = args.slice(0, 2);
				Array.prototype.push.apply(partlyArgs, this.partlyArgs);
				break;
		}

		// 更新 scopes
		scopes[method].apply(scopes, partlyArgs);
		this.partlyArgs.length = 0;

		// 同步更新下标序号
		each(scopes, function (scope, index) {
			scope.$index = index;
		});

		this.partly = false;
	}

	/**
	 * 重新构建列表
	 * @param   {Array}  list
	 */
	vfor.recompileList = function (list) {
		var next = this.$next;
		var prev = this.$prev;
		var parent = this.$parent;

		// 清空循环列表
		var child;
		while (child = (prev && prev.nextSibling || parent.firstChild)) {
			if (next && child === next) {
				break;
			}
			parent.removeChild(child);
		}

		// 移除所有取值域缓存
		this.scopes.length = 0;

		var listFragment = this.buildList(list);
		parent.insertBefore(listFragment, next);
	}

	/**
	 * 构建循环板块
	 * @param   {Array}     list        [列表数组]
	 * @param   {Number}    startIndex  [下标起点]
	 * @return  {Fragment}
	 */
	vfor.buildList = function (list, startIndex) {
		var vm = this.vm;
		var el = this.el;
		var start = startIndex || 0;
		var bodyDirs = el.__directives;
		var listFragment = createFragment();

		each(list, function (item, i) {
			var index = start + i;
			var alias = this.alias;
			var plate = el.cloneNode(true);
			var scope = Object.create(this.$scope || vm.$data);

			// 绑定别名
			observe(scope, alias, item);
			// 绑定下标
			observe(scope, '$index', index);

			if (this.partly) {
				this.partlyArgs.push(scope);
			} else {
				this.scopes.push(scope);
			}

			// 阻止重复编译除 vfor 以外的指令
			if (bodyDirs > 1) {
				vm.block(el);
			}

			// 标记别名
			markVforFeature(plate, vforAlias, alias);

			// 编译板块
			vm.complieElement(plate, true, scope);
			listFragment.appendChild(plate);
		}, this);

		return listFragment;
	}

	/**
	 * 获取完整的列表数据
	 * @return  {Array}
	 */
	vfor.getChilds = function () {
		var this$1 = this;

		var list = [];
		var childs = this.$parent.childNodes;

		for (var i = 0; i < childs.length; i++) {
			var child = childs[i];

			if (child[vforAlias] === this$1.alias) {
				list.push(child);
			}
		}

		return list;
	}

	/**
	 * 获取循环列表第一项
	 * @return  {Element}
	 */
	vfor.getFirst = function () {
		var prev = this.$prev;
		return prev && prev.nextSibling || this.$parent.firstChild;
	}

	/**
	 * 获取循环列表最后一项
	 * @return  {Element}
	 */
	vfor.getLast = function () {
		var next = this.$next;
		return next && next.previousSibling || this.$parent.lastChild;
	}

	/**
	 * 获取循环列表指定下标项
	 * @param   {Number}    index
	 * @return  {Element}
	 */
	vfor.getChild = function (index) {
		return this.getChilds()[index];
	}

	/**
	 * 删除循环列表的第一个元素 array.shift()
	 */
	vfor.shift = function () {
		var first = this.getFirst();
		if (first) {
			this.$parent.removeChild(first);
		}
	}

	/**
	 * 删除循环列表的最后一个元素 array.pop()
	 */
	vfor.pop = function () {
		var last = this.getLast();
		if (last) {
			this.$parent.removeChild(last);
		}
	}

	/**
	 * 在循环列表结尾追加元素 array.push(item)
	 * @param   {Array}  list
	 * @param   {Array}  args
	 */
	vfor.push = function (list, args) {
		var item = this.buildList(args, list.length - 1);
		this.$parent.insertBefore(item, this.$next);
	}

	/**
	 * 在循环列表开头追加元素 array.unshift(item)
	 * @param   {Array}  list
	 * @param   {Array}  args
	 */
	vfor.unshift = function (list, args) {
		var first = this.getFirst();
		var item = this.buildList(args, 0);
		this.$parent.insertBefore(item, first);
	}

	/**
	 * 循环列表的增删改 splice(start, deleteCount, inserts)
	 * @param   {Array}  list
	 * @param   {Array}  args
	 */
	vfor.splice = function (list, args) {
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

		// 只删除 splice(2, 1);
		var deleteOnly = deleteCont && !insertLength;
		// 只插入 splice(2, 0, 'xxx')
		var insertOnly = !deleteCont && insertLength;
		// 删除并插入 splice(2, 1, 'xxx')
		var deleAndInsert = deleteCont && insertLength;

		var parent = this.$parent;

		// 删除指定选项
		if (deleteOnly || deleAndInsert) {
			var oldList = this.getChilds();
			each(oldList, function (child, index) {
				// 删除的范围内
				if (index >= start && index < start + deleteCont) {
					parent.removeChild(child);
				}
			});
			oldList = null;
		}

		// 只插入 或 删除并插入
		if (insertOnly || deleAndInsert) {
			// 开始的元素
			var startChild = this.getChild(start);
			// 新增列表
			var listFrag = this.buildList(insertItems, start);
			// 更新变化部分
			parent.insertBefore(listFrag, startChild);
		}
	}

	/**
	 * v-text 指令解析模块
	 */
	function VText () {
		Parser.apply(this, arguments);
	}

	var vtext = linkParser(VText);

	/**
	 * 解析 v-text, {{ text }} 指令
	 * @param   {Element}  node   [指令节点]
	 * @param   {Object}   desc   [指令信息]
	 * @param   {Object}   scope  [vfor 取值域]
	 */
	vtext.parse = function () {
		this.bind();
	}

	/**
	 * 更新视图
	 * @param   {String}   textValue
	 */
	vtext.update = function (textValue) {
		this.el.textContent = String(textValue);
	}

	/**
	 * v-html 指令解析模块
	 */
	function VHtml () {
		Parser.apply(this, arguments);
	}

	var vhtml = linkParser(VHtml);

	/**
	 * 解析 v-html, {{{ html }}} 指令
	 */
	vhtml.parse = function () {
		this.bind();
	}

	/**
	 * 更新视图
	 * @param   {String}   htmlString
	 */
	vhtml.update = function (htmlString) {
		empty(this.el).appendChild(stringToFragment(String(htmlString)));
	}

	var visibleDisplay = '__visible__';

	/**
	 * 缓存节点行内样式显示值
	 * 行内样式 display = '' 不会影响由 classname 中的定义
	 * visibleDisplay 用于缓存节点行内样式的 display 显示值
	 * @param  {Element}  node
	 */
	function setVisibleDisplay (node) {
		if (!node[visibleDisplay]) {
			var display;
			var inlineStyle = removeSpace(getAttr(node, 'style'));

			if (inlineStyle && inlineStyle.indexOf('display') > -1) {
				var styles = inlineStyle.split(';');

				each(styles, function (style) {
					if (style.indexOf('display') > -1) {
						display = getKeyValue(style);
					}
				});
			}

			if (display !== 'none') {
				node[visibleDisplay] = display || '';
			}
		}
	}

	/**
	 * 设置节点 style.display 值
	 * @param  {Element}  node
	 * @param  {String}   display
	 */
	function setStyleDisplay (node, display) {
		node.style.display = display;
	}


	/**
	 * v-show 指令解析模块
	 */
	function VShow () {
		Parser.apply(this, arguments);
	}

	var vshow = linkParser(VShow);

	/**
	 * 解析 v-show 指令
	 */
	vshow.parse = function () {
		var el = this.el;

		setVisibleDisplay(el);

		// else 片段
		var elseEl = getNextElement(el);
		if (
			elseEl &&
			(hasAttr(elseEl, 'v-else') || elseEl.__directive === 'v-else')
		) {
			this.elseEl = elseEl;
			setVisibleDisplay(elseEl);
		}

		this.bind();
	}

	/**
	 * 更新视图
	 * @param   {Boolean}  isShow
	 */
	vshow.update = function (isShow) {
		var el = this.el;
		var elseEl = this.elseEl;

		setStyleDisplay(el, isShow ? el[visibleDisplay] : 'none');

		if (elseEl) {
			setStyleDisplay(elseEl, !isShow ? elseEl[visibleDisplay] : 'none');
		}
	}

	/**
	 * 处理 styleObject, 批量更新元素 style
	 * @param   {Element}  element
	 * @param   {String}   styleObject
	 */
	function updateStyle (element, styleObject) {
		var style = element.style;

		if (!isObject(styleObject)) {
			return warn('v-bind for style must be a type of Object', styleObject);
		}

		each(styleObject, function (value, property) {
			if (style[property] !== value) {
				style[property] = value;
			}
		});
	}

	/**
	 * 支持空格分割的 addClass
	 * @param   {Element}  element
	 * @param   {String}   className
	 * @param   {Boolean}  remove
	 */
	function handleClass (element, className, remove) {
		each(className.split(' '), function (cls) {
			if (remove) {
				removeClass(element, cls);
			} else {
				addClass(element, cls);
			}
		});
	}

	/**
	 * 更新元素的 className
	 * @param   {Element}  element
	 * @param   {Mix}      classValue
	 * @param   {Boolean}  remove
	 */
	function updateClass (element, classValue, remove) {
		if (isString(classValue)) {
			handleClass(element, classValue, remove);
		} else if (isArray(classValue)) {
			each(classValue, function (cls) {
				handleClass(element, cls, remove);
			});
		} else if (isObject(classValue)) {
			each(classValue, function (add, cls) {
				handleClass(element, cls, remove || !add);
			});
		}
	}


	/**
	 * v-bind 指令解析模块
	 */
	function VBind () {
		Parser.apply(this, arguments);
	}

	var vbind = linkParser(VBind);

	/**
	 * 解析 v-bind 指令
	 */
	vbind.parse = function () {
		this.desc.deep = true;
		this.bind();
	}

	/**
	 * 视图更新
	 * @param   {Mix}  newValue
	 * @param   {Mix}  oldValue
	 */
	vbind.update = function (newValue, oldValue) {
		var type = this.desc.args;
		if (type) {
			this.single(type, newValue, oldValue);
		} else {
			this.multi(newValue, oldValue);
		}
	}

	/**
	 * 解析单个 attribute
	 * @param   {String}  type
	 * @param   {Mix}     newValue
	 * @param   {Mix}     oldValue
	 */
	vbind.single = function (type, newValue, oldValue) {
		switch (type) {
			case 'class':
				this.handleClass(newValue, oldValue);
				break;
			case 'style':
				this.handleStyle(newValue, oldValue);
				break;
			default:
				this.handleAttr(type, newValue, oldValue);
		}
	}

	/**
	 * 解析 attribute, class, style 组合
	 * @param   {Object}  newJson
	 * @param   {Object}  oldJson
	 */
	vbind.multi = function (newJson, oldJson) {
		if (oldJson) {
			var ref = diff(newJson, oldJson);
			var after = ref.after;
			var before = ref.before;
			this.batch(after, before);
		}

		this.batch(newJson);
	}

	/**
	 * 绑定属性批处理
	 * @param   {Object}  newObj
	 * @param   {Object}  oldObj
	 */
	vbind.batch = function (newObj, oldObj) {
		each(newObj, function (value, key) {
			this.single(key, value, oldObj && oldObj[key]);
		}, this);
	}

	/**
	 * 更新处理 className
	 * @param   {Mix}  newClass
	 * @param   {Mix}  oldClass
	 */
	vbind.handleClass = function (newClass, oldClass) {
		var el = this.el;

		// 数据更新
		if (oldClass) {
			var ref = diff(newClass, oldClass);
			var after = ref.after;
			var before = ref.before;
			updateClass(el, before, true);
			updateClass(el, after);
		} else {
			updateClass(el, newClass);
		}
	}

	/**
	 * 更新处理 style
	 * @param   {Mix}  newStyle
	 * @param   {Mix}  oldStyle
	 */
	vbind.handleStyle = function (newStyle, oldStyle) {
		var el = this.el;

		// 数据更新
		if (oldStyle) {
			// 移除旧样式(设为 null)
			each(oldStyle, function (v, key) {
				oldStyle[key] = null;
			});

			updateStyle(el, oldStyle);
		}

		updateStyle(el, newStyle);
	}

	/**
	 * 更新处理 attribute
	 * @param   {String}   attr
	 * @param   {String}   newValue
	 * @param   {String}   oldValue
	 */
	vbind.handleAttr = function (attr, newValue, oldValue) {
		setAttr(this.el, attr, newValue);
	}

	var text = {
		/**
		 * 绑定 text 变化事件
		 */
		bind: function () {
			var self = this;
			var number = this.number;
			var directive = this.directive;

			// 解决中文输入时 input 事件在未选择词组时的触发问题
			// https://developer.mozilla.org/zh-CN/docs/Web/Events/compositionstart
			var composeLock;
			this.on('compositionstart', function () {
				composeLock = true;
			});
			this.on('compositionend', function () {
				composeLock = false;
			});

			// input 事件(实时触发)
			this.on('input', function () {
				if (!composeLock) {
					directive.set(formatValue(this.value, number));
				}
			});

			// change 事件(失去焦点触发)
			this.on('change', function () {
				directive.set(formatValue(this.value, number));
			});
		},

		/**
		 * 更新 text 值
		 * @param   {String}  value
		 */
		update: function (value) {
			var el = this.el;
			if (el.value !== value) {
				el.value = value;
			}
		}
	}

	var radio = {
		/**
		 * 绑定 radio 变化事件
		 */
		bind: function () {
			var number = this.number;
			var directive = this.directive;

			this.on('change', function () {
				directive.set(formatValue(this.value, number));
			});
		},

		/**
		 * 更新 radio 值
		 * @param   {String}  value
		 */
		update: function (value) {
			var el = this.el;
			el.checked = el.value === (isNumber(value) ? String(value) : value);
		}
	}

	/**
	 * 获取 select 的选中值
	 * @param   {Select}   select
	 * @param   {Boolean}  number
	 * @return  {Array}
	 */
	function getSelecteds (select, number) {
		var sels = [];
		var options = select.options;

		for (var i = 0; i < options.length; i++) {
			var option = options[i];
			var value = option.value;
			if (option.selected) {
				sels.push(formatValue(value, number));
			}
		}

		return sels;
	}

	var select = {
		/**
		 * 绑定 select 变化事件
		 */
		bind: function () {
			var multi = this.multi;
			var number = this.number;
			var directive = this.directive;

			this.on('change', function () {
				var sels = getSelecteds(this, number);
				directive.set(multi ? sels : sels[0]);
			});
		},

		/**
		 * 更新 select 值
		 * @param   {Array|String}  sels
		 */
		update: function (sels) {
			var this$1 = this;

			var el = this.el;
			var options = el.options;
			var multi = this.multi;
			var exp = this.desc.expression;

			if (multi && !isArray(sels)) {
				return warn('<select> cannot be multiple when the model set ['+ exp +'] as not Array');
			}

			if (!multi && isArray(sels)) {
				return warn('The model ['+ exp +'] cannot set as Array when <select> has no multiple propperty');
			}

			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				var val = formatValue(option.value, this$1.number);
				option.selected = multi ? sels.indexOf(val) > -1 : sels === val;
			}
		},

		/**
		 * 强制更新 select 的值，用于动态的 option
		 */
		forceUpdate: function () {
			this.update(this.directive.get());
		}
	}

	var checkbox = {
		/**
		 * 绑定 checkbox 变化事件
		 */
		bind: function () {
			var number = this.number;
			var directive = this.directive;

			this.on('change', function () {
				var value = directive.get();
				var checked = this.checked;

				if (isBool(value)) {
					directive.set(checked);
				} else if (isArray(value)) {
					var val = formatValue(this.value, number);
					var index = value.indexOf(val);

					// hook
					if (checked) {
						if (index === -1) {
							value.push(val);
						}
					} else {
						if (index > -1) {
							value.splice(index, 1);
						}
					}
				}
			});
		},

		/**
		 * 更新 checkbox 值
		 * @param   {Boolean|Array}  values
		 */
		update: function (values) {
			var el = this.el;
			var value = formatValue(el.value, this.number);

			if (!isArray(values) && !isBool(values)) {
				return warn('Checkbox v-model value must be a type of Boolean or Array');
			}

			el.checked = isBool(values) ? values : (values.indexOf(value) > -1);
		}
	}

	// 双向数据绑定限制的表单元素
	var validForms = [
		'input',
		'select',
		'textarea'
	];


	/**
	 * v-model 指令解析模块
	 */
	function VModel () {
		Parser.apply(this, arguments);
	}

	var vmodel = linkParser(VModel);

	/**
	 * 解析 v-model 指令
	 */
	vmodel.parse = function () {
		var el = this.el;
		var desc = this.desc;
		var tagName = el.tagName.toLowerCase();
		var type = tagName === 'input' ? getAttr(el, 'type') : tagName;

		if (validForms.indexOf(tagName) < 0) {
			return warn('v-model only for using in ' + validForms.join(', '));
		}

		// v-model 仅支持静态指令表达式
		if (!isNormal(desc.expression)) {
			return warn('v-model directive value can be use by static expression');
		}

		desc.duplex = true;
		this.number = hasAttr(el, 'number');

		// select 需要指令实例挂载到元素上
		if (tagName === 'select') {
			def(el, '__vmodel__', this);
			this.multi = hasAttr(el, 'multiple');
			this.forceUpdate = select.forceUpdate.bind(this);
		}

		this.bindDuplex(type);
	}

	/**
	 * 双向数据绑定
	 * @param   {String}  type
	 */
	vmodel.bindDuplex = function (type) {
		var model;

		switch (type) {
			case 'text':
			case 'password':
			case 'textarea':
				model = text;
				break;
			case 'radio':
				model = radio;
				break;
			case 'checkbox':
				model = checkbox;
				break;
			case 'select':
				model = select;
				break;
		}

		this.update = model.update.bind(this);
		this.bind();
		model.bind.apply(this);
	}

	/**
	 * 表单元素事件绑定
	 * @param   {String}    type
	 * @param   {Function}  callback
	 */
	vmodel.on = function (type, callback) {
		addEvent(this.el, type, callback, false);
	}

	var regNewline = /\n/g;
	var regText = /\{\{(.+?)\}\}/g;
	var regHtml = /\{\{\{(.+?)\}\}\}/g;
	var regMustacheSpace = /\s\{|\{|\{|\}|\}|\}/g;
	var regMustache = /(\{\{.*\}\})|(\{\{\{.*\}\}\})/;

	/**
	 * 是否是合法指令
	 * @param   {String}   directive
	 * @return  {Boolean}
	 */
	function isDirective (directive) {
		return directive.indexOf('v-') === 0;
	}

	/**
	 * 节点的子节点是否延迟编译
	 * 单独处理 vif, vfor 和 vpre 子节点的编译
	 * @param   {Element}  node
	 * @return  {Boolean}
	 */
	function isLateCompileChilds (node) {
		return hasAttr(node, 'v-if') || hasAttr(node, 'v-for') || hasAttr(node, 'v-pre');
	}

	/**
	 * 节点是否含有合法指令
	 * @param   {Element}  node
	 * @return  {Number}
	 */
	function hasDirective (node) {
		if (isElement(node) && node.hasAttributes()) {
			var nodeAttrs = node.attributes;

			for (var i = 0; i < nodeAttrs.length; i++) {
				if (isDirective(nodeAttrs[i].name)) {
					return true;
				}
			}

		} else if (isTextNode(node) && regMustache.test(node.textContent)) {
			return true;
		}
	}

	/**
	 * 获取指令信息
	 * @param   {Attr}    attribute
	 * @return  {Object}
	 */
	function getDirectiveDesc (attribute) {
		var attr = attribute.name;
		var expression = attribute.value;
		var directive, args, pos = attr.indexOf(':');

		if (pos > -1) {
			args = attr.substr(pos + 1);
			directive = attr.substr(0, pos);
		} else {
			directive = attr;
		}

		return { args: args, attr: attr, directive: directive, expression: expression };
	}

	/**
	 * 元素编译模块
	 * @param  {Object}  option  [参数对象]
	 */
	function Compiler (option) {
		var element = option.view;
		var model = option.model;

		if (!isElement(element)) {
			return warn('element must be a type of DOMElement: ', element);
		}

		if (!isObject(model)) {
			return warn('model must be a type of Object: ', model);
		}

		// 缓存根节点
		this.$element = element;
		// 根节点转文档碎片（element 将被清空）
		this.$fragment = nodeToFragment(element);

		// 数据模型对象
		this.$data = model;
		// DOM 注册索引
		defRec(this.$data, '$els', {});

		// 编译节点缓存队列
		this.$unCompiles = [];
		// 根节点是否已完成编译
		this.$rootComplied = false;

		// 指令实例缓存
		this.directives = [];
		// 指令解析模块
		this.parsers = { von: VOn, vel: VEl, vif: VIf, vfor: VFor, vtext: VText, vhtml: VHtml, vshow: VShow, vbind: VBind, vmodel: VModel };

		this.init();
	}

	var cp = Compiler.prototype;

	cp.init = function () {
		createObserver(this.$data, '__MODEL__');
		this.complieElement(this.$fragment, true);
	}

	/**
	 * 编译文档碎片/节点
	 * @param   {Element}  element  [文档碎片/节点]
	 * @param   {Boolean}  root     [是否编译根节点]
	 * @param   {Object}   scope    [vfor 取值域]
	 */
	cp.complieElement = function (element, root, scope) {
		var this$1 = this;

		var childNodes = element.childNodes;

		if (root && hasDirective(element)) {
			this.$unCompiles.push([element, scope]);
		}

		for (var i = 0; i < childNodes.length; i++) {
			var node = childNodes[i];

			if (hasDirective(node)) {
				this$1.$unCompiles.push([node, scope]);
			}

			if (node.hasChildNodes() && !isLateCompileChilds(node)) {
				this$1.complieElement(node, false, scope);
			}
		}

		if (root) {
			this.compileAll();
		}
	}

	/**
	 * 编译节点缓存队列
	 */
	cp.compileAll = function () {
		each(this.$unCompiles, function (info) {
			this.complieDirectives(info);
			return null;
		}, this);

		this.checkRoot();
	}

	/**
	 * 收集并编译节点指令
	 * @param   {Array}  info  [node, scope]
	 */
	cp.complieDirectives = function (info) {
		var node = info[0], scope = info[1];

		if (isElement(node)) {
			var vfor, attrs = [];
			// node 节点集合转为数组
			var nodeAttrs = node.attributes;

			for (var i = 0; i < nodeAttrs.length; i++) {
				var atr = nodeAttrs[i];
				var name = atr.name;

				if (isDirective(name)) {
					if (name === 'v-for') {
						vfor = atr;
					}
					attrs.push(atr);
				}
			}

			// vfor 编译时标记节点的指令数
			if (vfor) {
				def(node, '__directives', attrs.length);
				attrs = [vfor];
				vfor = null;
			}

			// 编译节点指令
			each(attrs, function (attr) {
				this.compile(node, attr, scope);
			}, this);

		} else if (isTextNode(node)) {
			this.compileText(node, scope);
		}
	}

	/**
	 * 编译元素节点指令
	 * @param   {Element}  node
	 * @param   {Object}   attr
	 * @param   {Object}   scope
	 */
	cp.compile = function (node, attr, scope) {
		var desc = getDirectiveDesc(attr);
		var directive = desc.directive;

		// 移除指令标记
		removeAttr(node, desc.attr);

		var dir = 'v' + directive.substr(2);
		var Parser = this.parsers[dir];

		// 不需要解析的指令
		if (dir === 'velse') {
			def(node, '__directive', directive);
			return;
		} else if (dir === 'vpre') {
			return;
		}

		if (Parser) {
			this.directives.push(new Parser(this, node, desc, scope));
		} else {
			warn('[' + directive + '] is an unknown directive!');
		}
	}

	/**
	 * 编译文本节点 {{ text }} 和 {{{ html }}}
	 * @param   {Element}  node
	 * @param   {Object}   scope
	 */
	cp.compileText = function (node, scope) {
		var exp, match, matches, pieces, tokens = [], desc = {};
		var text = node.textContent.trim().replace(regNewline, '');

		// html match
		if (regHtml.test(text)) {
			matches = text.match(regHtml);
			match = matches[0];
			exp = match.replace(regMustacheSpace, '');

			if (match.length !== text.length) {
				return warn('[' + text + '] compile for HTML can not have a prefix or suffix');
			}

			desc.expression = exp;
			this.directives.push(new this.parsers.vhtml(this, node.parentNode, desc, scope));

		} else {
			pieces = text.split(regText);
			matches = text.match(regText);

			// 文本节点转化为常量和变量的组合表达式
			// 'a {{b}} c' => '"a " + b + " c"'
			each(pieces, function (piece) {
				// {{text}}
				if (matches.indexOf('{{' + piece + '}}') > -1) {
					tokens.push('(' + piece + ')');
				} else if (piece) {
					tokens.push('"' + piece + '"');
				}
			});

			desc.expression = tokens.join('+');
			this.directives.push(new this.parsers.vtext(this, node, desc, scope));
		}
	}

	/**
	 * 停止编译节点的剩余指令
	 * 如遇到含有其他指令的 vfor 节点
	 * @param   {Element}  node
	 */
	cp.block = function (node) {
		each(this.$unCompiles, function (info) {
			if (node === info[0]) {
				return null;
			}
		});
	}

	/**
	 * 检查根节点是否编译完成
	 */
	cp.checkRoot = function () {
		if (this.$unCompiles.length === 0 && !this.$rootComplied) {
			this.$rootComplied = true;
			this.$element.appendChild(this.$fragment);
		}
	}

	/**
	 * 销毁函数
	 */
	cp.destroy = function () {
		this.$data = null;
		empty(this.$element);
		clearObject(this.parsers);
		each(this.directives, function (directive) {
			directive.destroy();
			return null;
		});
	}

	/**
	 * MVVM 构造函数入口
	 * @param  {Object}  option    [数据参数对象]
	 * @param  {Element}   - view    [视图对象]
	 * @param  {Object}    - model   [数据对象]
	 * @param  {Object}    - context [<可选>回调上下文]
	 */
	function MVVM (option) {
		this.context = option.context || this;

		// 将事件函数 this 指向调用者
		each(option.model, function (value, key) {
			if (isFunc(value)) {
				option.model[key] = value.bind(this.context);
			}
		}, this);

		// 初始数据备份，用于 reset
		this.backup = copy(option.model);

		// ViewModel 实例
		this.vm = new Compiler(option);

		// 数据模型
		this.$data = this.vm.$data;
	}

	var mvp = MVVM.prototype;

	/**
	 * 获取指定数据模型值
	 * 如果获取的模型为对象或数组
	 * 返回数据与原数据保持引用关系
	 * @param   {String}  key  [<可选>数据模型字段]
	 * @return  {Mix}
	 */
	mvp.get = function (key) {
		var data = this.$data;
		return isString(key) ? data[key] : data;
	}

	/**
	 * 获取指定数据模型值
	 * 如果获取的模型为对象或数组
	 * 返回数据与原数据将不会保持引用关系
	 * @param   {String}  key  [<可选>数据模型字段]
	 * @return  {Mix}
	 */
	mvp.getCopy = function (key) {
		return copy(this.get(key));
	}

	/**
	 * 设置数据模型的值，key 为 json 时则批量设置
	 * @param  {String}  key    [数据模型字段]
	 * @param  {Mix}     value  [值]
	 */
	mvp.set = function (key, value) {
		var data = this.$data;

		// 设置单个
		if (isString(key)) {
			data[key] = value;
		}
		// 批量设置
		else if (isObject(key)) {
			each(key, function (v, k) {
				data[k] = v;
			});
		}
	}

	/**
	 * 重置数据和视图为初始状态
	 * @param   {Array|String}  key  [<可选>数据模型字段，或字段数组，空则重置所有]
	 */
	mvp.reset = function (key) {
		var data = this.$data;
		var backup = this.backup;

		// 重置单个
		if (isString(key)) {
			data[key] = backup[key];
		}
		// 重置多个
		else if (isArray(key)) {
			each(key, function (v) {
				data[v] = backup[v];
			});
		}
		// 重置所有
		else {
			each(data, function (v, k) {
				data[k] = backup[k];
			});
		}
	}

	/**
	 * 监测表达式值的变化
	 * @param   {String}    expression  [监测的表达式]
	 * @param   {Function}  callback    [监测变化回调]
	 * @param   {Boolean}   deep        [<可选>深层依赖监测]
	 */
	mvp.watch = function (expression, callback, deep) {
		return new Watcher(this, {
			'deep': deep,
			'expression': expression
		}, callback.bind(this.context));
	}

	/**
	 * 销毁函数
	 */
	mvp.destroy = function () {
		this.vm.destroy();
		this.vm = this.context = this.backup = this.$data = null;
	}

	return MVVM;

}));