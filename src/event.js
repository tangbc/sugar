/**
 * 事件绑定 event
 */
define(['./util'], function(util) {

	/**
	 * Events 事件类（处理视图模块的事件绑定与解绑）
	 */
	function Events() {}
	Events.prototype = {
		constructor: Events,

		/**
		 * 为元素添加绑定事件
		 * @param  {Object}   elm       [绑定事件的元素]
		 * @param  {String}   _event    [绑定的事件，多个事件用空格分开]
		 * @param  {Object}   data      [<可选>传递到回调函数的额外数据]
		 * @param  {Function} callback  [回调函数, 回调参数evt, elm]
		 * @return {Boolean}            [result]
		 */
		bind: function(elm, _event, data, callback) {
			var context = this.context || this;

			if (!util.isJquery(elm)) {
				util.error('element must be a type of jQuery DOM: ', elm);
				return false;
			}

			// 不传data
			if (util.isFunc(data) || util.isString(data)) {
				callback = data;
				data = null;
			}

			// callback为属性值
			if (util.isString(callback)) {
				callback = context[callback];
			}

			// 不合法的回调函数
			if (!util.isFunc(callback)) {
				util.error('callback must be a type of Function: ', callback);
				return false;
			}

			var ret;
			elm.bind(_event, data, function(ev) {
				ret = callback.call(context, ev, this);
				// 阻止默认事件和冒泡
				if (ret === false) {
					ev.preventDefault();
					ev.stopPropagation();
				}
			});

			return true;
		},

		/**
		 * 从元素上移除bind添加的事件处理函数
		 * @param  {Object}   elm      [取消绑定事件的元素]
		 * @param  {String}   _event   [<可选>解绑的事件，多个事件用空格分开]
		 * @param  {Function} callback [<可选>指定事件取消绑定的函数名]
		 * @return {Boolean}           [result]
		 */
		unbind: function(elm, _event, callback) {
			var args = util.argumentsToArray(arguments);

			if (!util.isJquery(elm)) {
				util.error('element must be a type of jQuery DOM: ', elm);
				return false;
			}

			args.shift();

			elm.unbind.apply(elm, args);

			return true;
		},

		/**
		 * 代理事件，封装on方法
		 * @param  {Object}   elm      [绑定事件的元素]
		 * @param  {String}   _event   [绑定的事件，多个事件用空格分开]
		 * @param  {String}   selector [<可选>选择器，可为单个元素或者元素数组]
		 * @param  {Mix}      data     [<可选>传递到回调函数的额外数据]
		 * @param  {Function} callback [回调函数，回调参数evt, elm]
		 * @return {Boolean}           [result]
		 */
		proxy: function(elm, _event, selector, data, callback) {
			var arglen = arguments.length;
			var context = this.context || this;

			if (!util.isJquery(elm)) {
				util.error('element must be a type of jQuery DOM: ', elm);
				return false;
			}

			// selector和data传一个
			if (arglen === 4) {
				callback = data;
				if (!util.isString(selector)) {
					data = selector;
					selector = null;
				}
				else {
					data = null;
				}
			}
			// selector和data都不传
			else if (arglen === 3) {
				callback = selector;
				data = null;
				selector = null;
			}

			// callback为属性值
			if (util.isString(callback)) {
				callback = context[callback];
			}

			// 不合法的回调函数
			if (!util.isFunc(callback)) {
				util.error('callback must be a type of Function: ', callback);
				return false;
			}

			var ret;
			elm.on(_event, selector, data, function(ev) {
				ret = callback.call(context, ev, this);
				// 阻止默认事件和冒泡
				if (ret === false) {
					ev.preventDefault();
					ev.stopPropagation();
				}
			});

			return true;
		},

		/**
		 * 移除proxy添加的事件处理函数
		 * @param  {Object}   elm      [取消绑定事件的元素]
		 * @param  {String}   _event   [<可选>解绑的事件，可为多个事件用空格分开]
		 * @param  {Function} callback [<可选>指定事件取消绑定的函数名]
		 * @return {Boolean}           [result]
		 */
		unProxy: function(elm, _event, callback) {
			var args = util.argumentsToArray(arguments);

			if (!util.isJquery(elm)) {
				util.error('element must be a type of jQuery DOM: ', elm);
				return false;
			}

			args.shift();

			elm.off.apply(elm, args);

			return true;
		}
	};

	return new Events();
});