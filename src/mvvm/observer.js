import util from '../util';

// 重写的数组操作方法
const rewriteArrayMethods = [
	'pop',
	'push',
	'sort',
	'shift',
	'splice',
	'unshift',
	'reverse'
];

/**
 * 寻找匹配路径
 * @param   {String}   path
 * @return  {String}
 */
function getMatchPath (paths, path) {
	for (var i = 0; i < paths.length; i++) {
		if (path.indexOf(paths[i]) === 0) {
			return paths[i];
		}
	}
}

/**
 * observer 数据变化监测模块
 * @param  {Object}     object    [VM 数据模型]
 * @param  {Function}   callback  [变化回调函数]
 * @param  {Object}     context   [执行上下文]
 */
function Observer (object, callback, context) {
	if (util.isString(callback)) {
		callback = context[callback];
	}

	this.$context = context;
	this.$callback = callback;

	// 子对象路径
	this.$subs = [];
	// 当前数组操作标记
	this.$method = 921;

	this.observe(object);
}

var op = Observer.prototype;

/**
 * 监测数据模型
 * @param   {Object}  object  [监测的对象]
 * @param   {Array}   paths   [访问路径数组]
 */
op.observe = function (object, paths) {
	if (util.isArray(object)) {
		this.rewriteMethod(object, paths);
	}

	util.each(object, function (value, property) {
		var copies = paths && paths.slice(0);
		if (copies) {
			copies.push(property);
		} else {
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
op.bindWatch = function (object, paths, val) {
	var path = paths.join('*');
	var prop = paths[paths.length - 1];
	var descriptor = Object.getOwnPropertyDescriptor(object, prop);
	var getter = descriptor.get, setter = descriptor.set, ob = this;

	// 定义 object[prop] 的 getter 和 setter
	Object.defineProperty(object, prop, {
		get: function Getter () {
			return getter ? getter.call(object) : val;
		},

		set: function Setter (newValue) {
			var oldObject, oldValue = getter ? getter.call(object) : val;
			var isArrayMethod = rewriteArrayMethods.indexOf(ob.$method) > -1;

			if (newValue === oldValue) {
				return;
			}

			// 新值为对象或数组重新监测
			if (
				!isArrayMethod &&
				(util.isArray(newValue) || util.isObject(newValue))
			) {
				ob.observe(newValue, paths);
			}

			// 获取子对象路径
			var subPath = getMatchPath(ob.$subs, path);
			if (subPath) {
				oldObject = object[prop];
			}

			if (setter) {
				setter.call(object, newValue);
			} else {
				val = newValue;
			}

			if (isArrayMethod) {
				return;
			}

			// 回调参数
			var args;
			if (subPath) {
				args = [subPath, object[prop], oldObject];
			} else {
				args = [path, newValue, oldValue];
			}

			// 触发变更回调
			ob.trigger.apply(ob, args);
		}
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
		this.$subs.indexOf(path) === -1 &&
		!util.isNumber(+path.split('*').pop())
	) {
		this.$subs.push(path);
	}
}

/**
 * 重写指定的 Array 方法
 * @param   {Array}  array  [目标数组]
 * @param   {Array}  paths  [访问路径数组]
 */
op.rewriteMethod = function (array, paths) {
	var AP = Array.prototype;
	var arrayMethods = Object.create(AP);
	var path = paths && paths.join('*');

	util.each(rewriteArrayMethods, function (method) {
		var ob = this, original = AP[method];
		util.defRec(arrayMethods, method, function _redefineArrayMethod () {
			var i = arguments.length;
			var args = new Array(i), result;

			while (i--) {
				args[i] = arguments[i];
			}

			ob.$method = method;

			result = original.apply(this, args);

			ob.$method = 921;

			// 重新监测
			ob.observe(this, paths);

			// 触发回调
			ob.trigger(path, this, method, args);

			return result;
		});
	}, this);

	// 添加 $set 方法，提供需要修改的数组项下标 index 和新值 value
	util.defRec(arrayMethods, '$set', function $set (index, value) {
		// 超出数组长度默认在最后添加（相当于 push）
		if (index >= this.length) {
			index = this.length;
		}

		return this.splice(index, 1, value)[0];
	});

	// 添加 $remove 方法
	util.defRec(arrayMethods, '$remove', function $remove (item) {
		var index = this.indexOf(item);

		if (index > -1) {
			return this.splice(index, 1);
		}
	});

	array.__proto__ = arrayMethods;
}

/**
 * 触发变化回调
 * @param   {String}       path      [变更的访问路径]
 * @param   {Mix}          last      [新值，数组操作为新数组]
 * @param   {Mix|String}   old       [旧值，数组操作为操作方法]
 * @param   {Array}        args      [数组操作参数]
 */
op.trigger = function (path, last, old, args) {
	this.$callback.apply(this.$context, arguments);
}

/**
 * 销毁函数
 */
op.destroy = function () {
	this.$context = this.$callback = this.$subs = this.$method = null;
}

export default Observer;
