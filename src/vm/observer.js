/**
 * observer 数据变化监测模块
 */
define([
	'../util'
], function(util) {

	/**
	 * @param  {Object}        object    [VM数据模型]
	 * @param  {Array}         ignores   [忽略监测的字段]
	 * @param  {Function}      callback  [变化回调函数]
	 * @param  {Object}        context   [执行上下文]
	 * @param  {Object}        args      [<可选>回调参数]
	 */
	function Observer(object, ignores, callback, context, args) {
		if (util.isString(callback)) {
			callback = context[callback];
		}

		this.$ignores = ignores;
		this.$callback = callback;
		this.$context = context;
		this.$args = args;

		// 监测的对象集合，包括一级和嵌套对象
		this.$observers = [object];

		// 监测的数据副本，存储旧值
		this.$valuesMap = {'0': util.copy(object)};

		// 记录当前数组操作
		this.$arrayAction = 921;
		// 避免触发下标的数组操作
		this.$aviodArrayAction = ['shift', 'unshift', 'splice'];
		// 重写的Array方法
		this.$fixArrayMethods = 'push|pop|shift|unshift|splice|sort|reverse'.split('|');

		// 路径层级分隔符
		this.$separator = '*';

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
			this.rewriteArrayMethods(object, paths);
		}

		util.each(object, function(value, property) {
			var copies = paths && paths.slice(0);
			if (copies) {
				copies.push(property);
			}
			else {
				copies = [property];
			}

			if (!this.isIgnore(copies)) {
				this.setCache(object, value, property).bindWatching(object, copies);
			}

		}, this);

		return this;
	}

	/**
	 * 检查paths是否在排除范围内
	 * @param   {Array}    paths  [访问路径数组]
	 * @return  {Boolean}
	 */
	op.isIgnore = function(paths) {
		var ret, path = paths.join(this.$separator);

		util.each(this.$ignores, function(ignore) {
			if (ignore.indexOf(path) === 0) {
				ret = true;
				return false;
			}
		}, this);

		return ret;
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
	 * 对属性绑定监测方法
	 * @param   {Object|Array}  object  [对象或数组]
	 * @param   {Array}         paths   [访问路径数组]
	 */
	op.bindWatching = function(object, paths) {
		var prop = paths[paths.length - 1];

		// 定义object的getter和setter
		Object.defineProperty(object, prop, {
			get: (function getter() {
				return this.getCache(object, prop);
			}).bind(this),

			set: (function setter() {
				var newValue = arguments[0];
				var oldValue = this.getCache(object, prop);

				if (newValue !== oldValue) {
					if (util.isObject(newValue) || util.isArray(newValue)) {
						this.observe(newValue, paths);
					}

					this.setCache(object, newValue, prop);

					if (this.$aviodArrayAction.indexOf(this.$arrayAction) === -1) {
						this.triggerChange(paths.join(this.$separator), newValue, oldValue);
					}
				}
			}).bind(this)
		});

		var value = object[prop];

		// 嵌套数组或对象
		if (util.isArray(value) || util.isObject(value)) {
			this.observe(value, paths);
		}
	}

	/**
	 * 重写指定的Array方法
	 * @param   {Array}  array  [目标数组]
	 * @param   {Array}  paths  [访问路径数组]
	 */
	op.rewriteArrayMethods = function(array, paths) {
		var arrayProto = util.AP;
		var arrayMethods = Object.create(arrayProto);
		var path = paths && paths.join(this.$separator);

		util.each(this.$fixArrayMethods, function(method) {
			var self = this, original = arrayProto[method];
			util.defineProperty(arrayMethods, method, function _redefineArrayMethod() {
				var i = arguments.length, result;
				var args = new Array(i);

				while (i--) {
					args[i] = arguments[i];
				}

				self.$arrayAction = method;

				result = original.apply(this, args);

				self.$arrayAction = 921;

				// 重新监测
				self.observe(this, paths);

				// 触发回调
				self.triggerChange(path, this, method);

				return result;
			}, true, false, true);
		}, this);

		array.__proto__ = arrayMethods;

		return this;
	}

	/**
	 * 触发object变化回调
	 * @param   {String}       path      [变更路径]
	 * @param   {Mix}          last      [新值]
	 * @param   {Mix|String}   old       [旧值/数组操作名称]
	 */
	op.triggerChange = function(path, last, old) {
		this.$callback.apply(this.$context, [path, last, old, this.$args]);
	}

	return Observer;
});