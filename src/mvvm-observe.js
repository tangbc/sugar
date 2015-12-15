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
		var isArray = util.isArray(object);
		var isObject = util.isObject(object);

		if (!isObject && !isArray) {
			util.error('object must be a type of Object or Array: ', object);
			return;
		}
		if (!util.isFunc(callback)) {
			util.error('callback must be a type of Function: ', callback);
			return;
		}

		// 参数存储
		this._object = object;
		this._callback = callback;
		this._context = context || util.WIN;

		/**
		 * 需要重写的Array方法
		 * @type  {String}
		 */
		this.fixArrayMethods = 'push|pop|shift|unshift|splice|concat|sort|reverse'.split('|');

		// 监听数组，重写数组方法
		if (isArray) {
			this.rewriteArrayMethod();
		}

		// 绑定监测
		this.handlerProperties(object);
	}
	Observer.prototype = {
		constructor: Observer,

		/**
		 * 处理属性或下标的监测和数据缓存
		 * @param   {Object|Array}  object  [对象或数组]
		 */
		handlerProperties: function(object) {
			if (!object._cacheProps) {
				object._cacheProps = {};
			}

			util.each(object, function(value, property) {
				if (property !== '_cacheProps') {
					object._cacheProps[property] = value;
					this.bindWatching(object, property);
				}
			}, this);

			return this;
		},

		/**
		 * 为对象绑定指定属性的监测
		 * @param   {Object}  object    [对象]
		 * @param   {String}  property  [属性]
		 */
		bindWatching: function(object, property) {
			var cacheProps = object._cacheProps;

			var value = object[property];
			Object.defineProperty(object, property, {
				get: function getter() {
					return cacheProps[property];
				},
				set: (function setter(newValue) {
					var oldValue = cacheProps[property];
					cacheProps[property] = newValue;
					this.triggerChanged(property, newValue, oldValue, object);
				}).bind(this)
			});

			if (util.isObject(value)) {
				this.handlerProperties(value);
			}
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

					this.triggerChanged(method, newResult, oldResult, array);

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
		 * @param   {String}        property  [属性名]
		 * @param   {Mix}           newValue  [新值]
		 * @param   {Mix}           oldValue  [旧值]
		 * @param   {Object|Array}  object    [变更对象]
		 */
		triggerChanged: function(property, newValue, oldValue, object) {
			this._callback.apply(this._context, arguments);
		}
	}


	/**
	 * 对象监测处理构造函数
	 */
	function OBSERVER() {
		/**
		 * 添加对象监测
		 * @param   {Object|Array}    object    [监测的对象]
		 * @param   {Function}        callback  [回调函数]
		 */
		this.observe = function(object, callback) {
			new Observer(object, callback);
		}

		/**
		 * 移除对象监测
		 * @param   {Object|Array}  object  [description]
		 */
		this.unObserve = function(object) {}
	}

	return new OBSERVER();
});