/**
 * observe模块
 */
define(['./util'], function(util) {

	/**
	 * 对象变化监测类
	 * @param  {Object|Array}  object    [对象或数组]
	 * @param  {Function}      callback  [变化回调函数]
	 * @param  {Object}        context   [<可选>执行上下文]
	 */
	function Observer(object, callback, context) {
		this._object = object;
		this._callback = callback;
		this._context = context || util.WIN;
	}
	Observer.prototype = {
		constructor: Observer,

		init: function() {
			var cb = this._callback;
			var object = this._object;
			var isArray = util.isArray(object);
			var isObject = util.isObject(object);

			if (!isObject && !isArray) {
				util.error('object must be a type of Object or Array: ', object);
				return;
			}
			if (!util.isFunc(cb)) {
				util.error('callback must be a type of Function: ', cb);
				return;
			}

			/**
			 * 需要重写的Array方法
			 * @type  {String}
			 */
			this.fixArrayMethods = 'push|pop|shift|unshift|splice|concat|sort|reverse'.split('|');

			/**
			 * 监测的对象集合，包括一级和嵌套的对象
			 * @type  {Array}
			 */
			this.observers = [object];

			/**
			 * 监测的对象副本
			 * @type  {Object}
			 */
			this.valuesMap = {
				'0': util.copy(object)
			};

			// 处理数组
			if (isArray) {
				this.observeArray(object);
				this.rewriteArrayMethod();
			}

			// 处理对象
			if (isObject) {
				this.observeObject(object);
			}
		},

		/**
		 * 监测数组
		 */
		observeArray: function(array) {
			this.handlerProperties(array);
		},

		/**
		 * 监测对象
		 */
		observeObject: function(object) {
			this.handlerProperties(object);
		},

		/**
		 * 处理对象属性的监测和数据缓存
		 * @param   {Object|Array}  object  [对象或数组]
		 */
		handlerProperties: function(object) {
			util.each(object, function(value, property) {
				this.setCacheProps(object, value, property)
					.bindWatching(object, property);
			}, this);

			return this;
		},

		/**
		 * 获取target在源对象上的访问路径
		 * @param   {Object}  target    [目标对象]
		 * @param   {String}  property  [属性]
		 * @return  {String}            [访问路径,以*分割层级]
		 */
		getPaths: function(target, property) {
			var last, paths = [];
			var srcObj = this._object;
			var value = target[property];

			var getPropertyPath = function _getPropertyPath(obj) {
				util.each(obj, function(val, pro) {
					// 目标匹配
					if (val === value && pro === property) {
						last = pro;
						return false;
					}
					// 嵌套对象递归调用
					else if (util.isObject(val)) {
						paths.push(pro);
						_getPropertyPath(val);
					}
				});
			}

			// 一级属性
			if (util.has(property, srcObj)) {
				paths.push(property);
			}
			// 嵌套属性
			else {
				getPropertyPath(srcObj);
				paths.push(last);
			}

			return paths.join('*');
		},

		/**
		 * 获取指定对象的属性缓存值
		 * @param   {Object}  object    [指定对象]
		 * @param   {String}  property  [属性名称]
		 * @return  {Object}            [属性值]
		 */
		getCacheProps: function(object, property) {
			var index = this.observers.indexOf(object);
			var value = (index === -1) ? null : this.valuesMap[index];
			return value ? value[property] : null;
		},

		/**
		 * 设置指定对象的属性缓存映射
		 * @param  {Object}  object    [指定对象]
		 * @param  {Mix}     value     [值]
		 * @param  {String}  property  [属性名称]
		 */
		setCacheProps: function(object, value, property) {
			var observers = this.observers;
			var valuesMap = this.valuesMap;
			var oleng = observers.length;
			var index = observers.indexOf(object);

			// 不存在，建立记录
			if (index === -1) {
				observers.push(object);
				valuesMap[oleng] = util.copy(object);
			}
			// 记录存在，重新对property赋值
			else {
				valuesMap[index][property] = value;
			}

			return this;
		},

		/**
		 * 对指定属性绑定监测
		 * @param   {Object}  object    [对象]
		 * @param   {String}  property  [属性]
		 */
		bindWatching: function(object, property) {
			var value = object[property];
			var path = this.getPaths.apply(this, arguments);

			// 嵌套数组
			if (util.isArray(value)) {
				this.observeArray(value, index);
			}

			// 嵌套对象
			if (util.isObject(value)) {
				this.observeObject(value, property);
			}

			Object.defineProperty(object, property, {
				get: (function getter() {
					return this.getCacheProps(object, property);
				}).bind(this),
				set: (function setter() {
					var newValue = arguments[0];
					var oldValue = this.getCacheProps(object, property);

					this.setCacheProps(object, newValue, property)
						.triggerChange(path, newValue, oldValue, object);
				}).bind(this)
			});
		},

		/**
		 * 重写Array方法
		 */
		rewriteArrayMethod: function() {
			var array = this._object;
			var arrayProto = util.AP;

			util.each(this.fixArrayMethods, function(method) {
				array[method] = (function reDefine() {
					var args = util.argumentsToArray(arguments);
					var oldResult = this.clearArray(array);
					var result = arrayProto[method].apply(array, args);
					var newResult = this.clearArray(array);

					// 重新处理下标
					this.handlerProperties(array);

					this.triggerChange(method, newResult, oldResult, array);

					return result;
				}).bind(this)
			}, this);
		},

		/**
		 * 返回纯下标形式的数组(不引用)
		 * @param   {Array}  array  [原数组]
		 * @return  {Array}         [结果数组]
		 */
		clearArray: function(array) {
			var ret = [];
			util.each(array, function(value, index) {
				ret[index] = value;
			});
			return ret;
		},

		/**
		 * 触发对象属性值变化回调
		 * @param   {String}         property  [属性名]
		 * @param   {Mix}            newValue  [新值]
		 * @param   {Mix}            oldValue  [旧值]
		 * @param   {Object|Array}   target    [原值]
		 */
		triggerChange: function(property, newValue, oldValue, target) {
			this._callback.apply(this._context, arguments);
		}
	}

	return Observer;
});