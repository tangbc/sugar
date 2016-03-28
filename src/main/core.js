/**
 * sugar顶层模块实例
 */
define([
	'../util',
	'./cache',
	'./module',
	'./messager'
], function(util, cache, Module, messager) {

	/**
	 * Core 核心模块，用于顶层模块的创建
	 */
	var Core = Module.extend({
		/**
		 * 获取顶级模块实例
		 * @param  {String}  name  [模块实例名称]
		 * @return {Object}
		 */
		get: function(name) {
			return this.getChild(name);
		},

		/**
		 * 全局广播消息，由core模块发出，系统全部实例接收
		 * @param  {String}   name   [发送的消息名称]
		 * @param  {Mix}      param  [<可选>附加消息参数]
		 * @return {Boolean}
		 */
		globalCast: function(name, param) {
			if (!util.isString(name)) {
				util.error('message\'s name must be a type of String: ', name);
				return;
			}

			messager.globalCast(name, param);
		}
	});

	var core = cache['0'] = new Core();

	return core;
});