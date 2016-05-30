/**
 * observer 数据变化监测模块
 */
define([
	'../util'
], function(util) {

	/**
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

		// 监测的对象集合，包括一级和嵌套对象
		this.$observers = [object];
		// 监测的数据副本，存储旧值
		this.$valuesMap = {'0': util.copy(object)};
		// 子对象字段，子对象的内部变更只触发顶层字段
		this.$subPaths = [];

		// 记录当前数组操作
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

			this.setCache(object, value, property).bindWatch(object, copies);
		}, this);

		return this;
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
	 * 拦截对象属性存取描述符（绑定监测）
	 * @param   {Object|Array}  object  [对象或数组]
	 * @param   {Array}         paths   [访问路径数组]
	 */
	op.bindWatch = function(object, paths) {
		var path = paths.join('*');
		var prop = paths[paths.length - 1];

		// 定义 object[prop] 的 getter 和 setter
		Object.defineProperty(object, prop, {
			get: (function getter() {
				return this.getCache(object, prop);
			}).bind(this),

			set: (function setter() {
				var newValue = arguments[0], pathSub;
				var oldValue = this.getCache(object, prop), oldObject;

				if (newValue !== oldValue) {
					if (util.isArray(newValue) || util.isObject(newValue)) {
						this.observe(newValue, paths);
					}

					// 获取子对象路径
					pathSub = this.getPathSub(path);
					if (pathSub) {
						oldObject = util.copy(object);
					}

					this.setCache(object, newValue, prop);

					if (this.$methods.indexOf(this.$action) === -1) {
						if (pathSub) {
							this.trigger(pathSub, object[prop], oldObject[prop]);
						}
						else {
							this.trigger(path, newValue, oldValue);
						}
					}
				}
			}).bind(this)
		});

		var value = object[prop];
		var isObject = util.isObject(value);

		// 嵌套数组或对象
		if (util.isArray(value) || isObject) {
			this.observe(value, paths);
		}

		// 缓存子对象字段
		if (isObject && this.$subPaths.indexOf(path) === -1 && !/^[0-9]*$/.test(path.split('*').pop())) {
			this.$subPaths.push(path);
		}
	}

	/**
	 * 是否是子对象路径，如果是则返回对象路径
	 * @param   {String}   path
	 * @return  {String}
	 */
	op.getPathSub = function(path) {
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
		var arrayProto = util.AP;
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
			if (index >= this.length) {
				this.length = index + 1;
			}

			return this.splice(index, 1, value)[0];
		});

		// 添加 $remove 方法
		util.defRec(arrayMethods, '$remove', function $remove(item) {
			var index;

			if (!this.length) {
				return;
			}

			index = this.indexOf(item);

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

	return Observer;
});