/**
 * [工具方法模块]
 */
define(function(require, util) {
	var UDF, LANG;
	var WIN = window;
	var OP = Object.prototype;
	var AP = Array.prototype;
	var docBody = document.body;
	var docElem = document.documentElement;

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
	 * inArray 数组中是否存在某元素
	 * @param  {Mix}   ele [目标元素]
	 * @param  {Array} arr [查询数组]
	 * @return {Number}    [数组下标]
	 */
	function inArray(ele, arr) {
		if (isArray(arr)) {
			return arr.indexOf(ele);
		}
		return -1;
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
	util.typeOfObject = typeOfObject;
	util.isObject = isObject;
	util.isArray = isArray;
	util.isFunc = isFunc;
	util.isString = isString;
	util.inArray = inArray;
	util.isBoolean = isBoolean;
	util.isNumber = isNumber;
	util.isFakeArray = isFakeArray;
	util.isPlainObject = isPlainObject;
	util.isJquery = isJquery;

	// 多语言转换函数，若未定义则原样返回
	LANG = !isFunc(WIN && WIN.T) ? function(text) {
		return util.templateReplace.apply(this, arguments);
	} : WIN.T;

	/**
	 * 日志函数
	 */
	var cons = WIN.console || {};
	util.log = function() {
		cons.log.apply(cons, arguments);
	}
	util.error = function() {
		if (cons.error.apply) {
			cons.error.apply(cons, arguments);
		}
		else {
			cons.error(arguments[0]);
		}
	}

	/**
	 * 读取对象（数据）属性
	 * @param   {Object}  data  [对象数据]
	 * @param   {String}  name  [属性名称]
	 * @return  {Mix}           [读取结果]
	 */
	util.get = function(data, name) {}

	/**
	 * 设置对象（数据）属性
	 * @param   {Object}  data  [对象数据]
	 * @param   {String}  name  [属性名称]
	 * @return  {Mix}     value [设置值]
	 * @return  {Object}  data  [对象数据]
	 */
	util.set = function(data, name, value) {}

	/*
	 * has 自有属性检测
	 */
	function has(key, obj) {
		if (key === UDF) {
			return false;
		}
		return OP.hasOwnProperty.call(obj, key);
	}
	util.has = has;

	/**
	 * scrollTo 自定义滚动条位置
	 * @param  {Number} x [横位置]
	 * @param  {Number} y [纵位置]
	 */
	util.scrollTo = function(x, y) {
		x = x || 0;
		y = y || 0;
		WIN.scrollTo(x, y);
	}

	/**
	 * argumentsToArray 参数转数组
	 * @param  {Object} args [参数]
	 * @return {Array}       [数组]
	 */
	util.argumentsToArray = function(args) {
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
	util.getKey = function(val, obj) {
		var key = '';
		if ((val && obj) && isObject(obj)) {
			for (key in obj) {
				if (has(key, obj)) {
					return key;
				}
			}
		}
		return UDF;
	}

	/**
	 * isEmpty 检测是否为空对象或者空数组
	 * @param  {String} val  [值]
	 * @return {Boolean}     [空为真,非空为假]
	 */
	util.isEmpty = function(val) {
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
	util.each = function(items, callback, context) {
		if (!context) {
			context = WIN;
		}
		var ret, i;
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
	util.guid = function(fix) {
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
	util.random = function(begin, end) {
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
	util.htmlEncode = function(html) {
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
	util.find = function(arr, value, field) {
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
	util.parse = function(param) {
		var arr = [];
		for (var pro in param) {
			arr.push(pro + '=' + param[pro]);
		}
		return '?' + arr.join('&');
	},

	/**
	 * getClientHeight 获取页面可视区高度
	 */
	util.getClientHeight = function() {
		return document.compatMode === 'CSS1Compat' ? docElem.clientHeight : docBody.clientHeight;
	}

	/**
	 * getClientWidth 获取页面可视区宽度
	 */
	util.getClientWidth = function() {
		return document.compatMode === 'CSS1Compat' ? docElem.clientWidth : docBody.clientWidth;
	}

	/**
	 * getClient 获取页面可视区信息
	 */
	util.getClient = function() {
		return {
			'width': this.getClientWidth(),
			'height': this.getClientHeight()
		}
	}

	/**
	 * removeTags 去掉html标签
	 */
	util.removeTags = function(html) {
		return html.toString().replace(/<[^>]+>/g, '');
	}

	/**
	 * fixZero 自动补0, (9 , 1) -> 09; (9 , 3) -> 0009
	 * num: 原始数值 ; zeros: 补0个数
	 */
	util.fixZero = function(num, zeros) {
		var b, v, x = 10, y, ns = num.toString().length;
		if (!isNumber(zeros) || !isNumber(zeros)) {
			return num;
		}
		y = ns + zeros;
		b = Math.pow(x, y);
		v = b + num;
		return v.toString().substr(1);
	}

	/*
	 * 格式化某段时间, 返回与当前的时间差 2015-05-16 16:14:30
	 */
	util.prettyDate = function(dateStr) {
		if (!isString(dateStr)) {
			return dateStr
		}
		var date = new Date();
		// 分离年月日时分秒
		var dateArr = dateStr.split(new RegExp('[:| |-]', 'ig'));
		var year   = +dateArr[0],
			month  = +dateArr[1] - 1,
			day    = +dateArr[2],
			hour   = +dateArr[3],
			minute = +dateArr[4],
			second = +dateArr[5];
		// 时分补0
		hour = hour < 10 ? this.fixZero(hour, 1) : hour;
		minute = minute < 10 ? this.fixZero(minute, 1) : minute;
		// 计算秒数差值
		var opDate = new Date(year, month, day , hour, minute, second);
		var secondDiff = (new Date().getTime() - opDate.getTime()) / 1000;
		var retStr = '';
		if (secondDiff < 60) {
			retStr = LANG('刚刚');
		}
		if (!retStr && secondDiff < 60 * 30) {
			retStr = LANG('{1}分钟前', Math.ceil(secondDiff / 60));
		}
		if (!retStr && secondDiff < 1800) {
			retStr= LANG('半小时前');
		}
		if (!retStr && secondDiff < 3600) {
			retStr= LANG('1小时前');
		}
		if (!retStr && secondDiff < 3600 * 2) {
			retStr= LANG('2小时前');
		}
		if (!retStr && secondDiff < 3600 * 3) {
			retStr= LANG('3小时前');
		}
		if (!retStr && date.getFullYear() == year && date.getMonth() == month && date.getDate() == day) {
			retStr = LANG('今天') + hour + ':' + minute;
		}
		if (!retStr && date.getFullYear() == year && date.getMonth() == month && date.getDate() - 1 == day) {
			retStr = LANG('昨天') + hour + ':' + minute;
		}
		if (!retStr && date.getFullYear() == year && date.getMonth() == month && date.getDate() - 2 == day) {
			retStr = LANG('前天') + hour + ':' + minute;
		}
		if (!retStr && date.getFullYear() == year && date.getMonth() == month) {
			retStr = LANG('{1}月{2}日', month + 1, day);
		}
		if (!retStr && date.getFullYear() == year) {
			retStr = LANG('今年{1}月{2}日', month + 1, day);
		}
		if (!retStr && date.getFullYear() - 1 == year) {
			retStr = LANG('去年{1}月{2}日', month + 1, day);
		}
		if (!retStr && date.getFullYear() - year > 1) {
			retStr = LANG('{1}年{2}月{3}日', year, month + 1, day);
		}
		return retStr;
	}

	/*
	 * 模板替换
	 * eg. util.templateReplace('<a href="{1}">{2}</a>', 'http://www.tangbc.com', '小前端')
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
	util.templateReplace = function(template /*, replaceN ... */) {
		templateReplaceList = arguments;
		return template.replace(templateReplaceRegx, _templateReplace);
	}

	/**
	 * 防环状嵌套克隆
	 * @param {Mix} obj 克隆的对象值
	 */
	function Clone(obj) {
		if (isPlainObject(obj) || isArray(obj)) {
			var cloneKey = '___deep_clone___';

			// 已经被克隆过, 返回新克隆对象
			if (obj[cloneKey]) {
				return obj[cloneKey];
			}

			var objClone = obj[cloneKey] = (obj instanceof Array ? [] : {});
			for (var key in obj) {
				if (key !== cloneKey && has(key, obj)) {
					objClone[key] = (typeOfObject(obj[key]) ? Clone(obj[key]) : obj[key]);
				}
			}
			delete obj[cloneKey];
			return objClone;
		}
		return obj;
	}
	util.clone = Clone;

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
				dst = Clone(src);
			break;
			// 目标是数组, 新值是对象
			case 2:
				if (!isFakeArray(src)) {
					dst = Clone(src);
					break;
				}
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
				dst[key] = Clone(value);
			}
		}
		// 直接赋值
		else {
			dst[key] = value;
		}
	}
	util.extend = function() {
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
	 * 字符串首字母大写
	 */
	util.ucFirst = function(str) {
		if (!isString(str)) {
			return str;
		}
		var first = str.charAt(0).toUpperCase();
		return first + str.substr(1);
	}
});