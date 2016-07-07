import util from '../util';

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
			var i = arguments.length, result;
			var args = new Array(i);

			while (i--) {
				args[i] = arguments[i];
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

export default Observer;
