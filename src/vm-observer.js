/**
 * observer模块
 */
define(['./util'], function(util) {

	/**
	 * 对象变化监测类
	 * @param  {Object|Array}  object    [对象或数组]
	 * @param  {Array}         ranges    [<可选>监测的字段范围]
	 * @param  {Function}      callback  [变化回调函数]
	 * @param  {Object}        context   [<可选>执行上下文]
	 * @param  {Object}        args      [<可选>回调参数]
	 */
	function Observer(object, ranges, callback, context, args) {
		if (!util.isArray(ranges)) {
			context = callback;
			callback = ranges;
			ranges = null;
		}

		if (util.isString(callback)) {
			callback = context[callback];
		}

		this.ranges = ranges;
		this.callback = callback;
		this.context = context || util.GLOBAL;
		this.args = args;

		/**
		 * 监测的对象集合，包括一级和嵌套对象
		 * @type  {Array}
		 */
		this.observers = [object];

		/**
		 * 监测的对象副本，存储旧值
		 * @type  {Object}
		 */
		this.valuesMap = {
			'0': util.copy(object)
		};

		/**
		 * 需要重写的Array方法
		 * @type  {Array}
		 */
		this.fixArrayMethods = 'push|pop|shift|unshift|splice|sort|reverse'.split('|');

		/**
		 * 属性层级分隔符
		 * @type  {String}
		 */
		this.separator = '*';

		// 处理数组
		if (util.isArray(object)) {
			this.observeArray(object);
		}

		// 处理对象
		if (util.isObject(object)) {
			this.observeObject(object);
		}
	}
	Observer.prototype = {
		constructor: Observer,

		/**
		 * 监测数组
		 * @param   {Array}   array   [监测的数组]
		 * @param   {Array}   paths   [<可选>访问路径数组]
		 */
		observeArray: function(array, paths) {
			this.rewriteArrayMethods(array, paths)
			.handleProperties(array, paths);
		},

		/**
		 * 监测对象
		 * @param   {Object}  object  [监测的对象]
		 * @param   {Array}   paths   [<可选>访问路径数组]
		 */
		observeObject: function(object, paths) {
			this.handleProperties(object, paths);
		},

		/**
		 * 处理对象属性的监测和数据缓存
		 * @param   {Object|Array}  object  [对象或数组]
		 * @param   {Array}         paths   [<可选>访问路径数组]
		 */
		handleProperties: function(object, paths) {
			util.each(object, function(value, property) {
				// 路径副本
				var copies = paths && paths.slice(0);
				if (copies) {
					copies.push(property);
				}
				else {
					copies = [property];
				}

				if (this.checkWatch(copies) !== -1) {
					this.setCache(object, value, property)
					.bindWatching(object, copies);
				}

			}, this);

			return this;
		},

		/**
		 * 检查paths是否在监测范围内
		 * @param   {Array}    paths  [访问路径数组]
		 * @return  {Number}          [-1为不在范围]
		 */
		checkWatch: function(paths) {
			var flag = -1;
			var ranges = this.ranges;
			var path = paths.join(this.separator);

			if (!util.isArray(ranges)) {
				return 1;
			}

			util.each(ranges, function(range) {
				if (range.indexOf(path) === 0) {
					flag = 1;
					return false;
				}
			}, this);

			return flag;
		},

		/**
		 * 获取指定对象的属性缓存值
		 * @param   {Object}  object    [指定对象]
		 * @param   {String}  property  [属性名称]
		 * @return  {Object}            [属性值]
		 */
		getCache: function(object, property) {
			var index = this.observers.indexOf(object);
			var value = (index === -1) ? null : this.valuesMap[index];
			return value ? value[property] : value;
		},

		/**
		 * 设置指定对象的属性与值的缓存映射
		 * @param  {Object}  object    [指定对象]
		 * @param  {Mix}     value     [值]
		 * @param  {String}  property  [属性名称]
		 */
		setCache: function(object, value, property) {
			var observers = this.observers;
			var valuesMap = this.valuesMap;
			var oleng = observers.length;
			var index = observers.indexOf(object);

			// 不存在，建立记录
			if (index === -1) {
				observers.push(object);
				valuesMap[oleng] = util.copy(object);
			}
			// 记录存在，重新对object[property]赋值
			else {
				valuesMap[index][property] = value;
			}

			return this;
		},

		/**
		 * 对属性绑定监测方法
		 * @param   {Object|Array}  object  [对象或数组]
		 * @param   {Array}         paths   [访问路径数组]
		 */
		bindWatching: function(object, paths) {
			var prop = paths[paths.length - 1];

			// 定义object的getter和setter
			Object.defineProperty(object, prop, {
				get: (function getter() {
					return this.getCache(object, prop);
				}).bind(this),

				set: (function setter() {
					var newValue = arguments[0];
					var oldValue = this.getCache(object, prop);

					this.setCache(object, newValue, prop)
					.triggerChange(paths.join(this.separator), newValue, oldValue, object);
				}).bind(this)
			});

			var value = object[prop];

			// 嵌套数组
			if (util.isArray(value)) {
				this.observeArray(value, paths);
			}

			// 嵌套对象
			if (util.isObject(value)) {
				this.observeObject(value, paths);
			}
		},

		/**
		 * 重写指定的Array方法
		 * @param   {Array}  array  [目标数组]
		 * @param   {Array}  paths  [<可选>访问路径数组]
		 */
		rewriteArrayMethods: function(array, paths) {
			var arrayProto = util.AP;
			var arrayMethods = Object.create(arrayProto);
			var path = paths && paths.join(this.separator);

			util.each(this.fixArrayMethods, function(method) {
				var self = this;
				var original = arrayProto[method];
				this.modifyProperty(arrayMethods, method, function redefineArrayMethod() {
					var i = arguments.length, result;
					var args = new Array(i);
					while (i--) {
						args[i] = arguments[i];
					}
					result = original.apply(this, args);

					// 触发回调
					self.triggerArrayMethod(method, path, this);

					// 重新监测数组
					self.observeArray(this);

					return result;
				});
			}, this);

			array.__proto__ = arrayMethods;

			return this;
		},

		/**
		 * 修改target的property属性
		 * @param   {Object|Array}  target    [数组或对象]
		 * @param   {String}        property  [属性或下标]
		 * @param   {Mix}           value     [修改值]
		 */
		modifyProperty: function(target, property, value) {
			Object.defineProperty(target, property, {
				'value'       : value,
				'enumerable'  : false,
				'writable'    : true,
				'configurable': true
			});
		},

		/**
		 * 触发array操作回调
		 * @param   {String}  method  [操作方法]
		 * @param   {Array}   path    [访问路径,undefined则为操作顶级数组]
		 * @param   {Array}   array   [操作数组（不传入回调）]
		 */
		triggerArrayMethod: function(method, path, array) {
			this.callback.apply(this.context, ['Array:' + method, path, this.args]);
		},

		/**
		 * 触发object变化回调
		 * @param   {String}         path      [变更路径]
		 * @param   {Mix}            last      [新值]
		 * @param   {Mix}            old       [旧值]
		 * @param   {Object|Array}   target    [变化对象（不传入回调）]
		 */
		triggerChange: function(path, last, old, target) {
			this.callback.apply(this.context, [path, last, old, this.args]);
		}
	}

	return Observer;
});