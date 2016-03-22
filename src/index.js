define([
	'./ajax',
	'./sync',
	'./core',
	'./module',
	'./container'
], function(ajax, sync, core, Module, Container) {

	function Sugar() {
		/**
		 * Ajax
		 * @type  {Object}
		 */
		this.ajax = ajax;

		/**
		 * 异步回调状态锁
		 * @type  {Function}
		 */
		this.sync = sync;

		/**
		 * 系统核心模块实例
		 * @type  {Object}
		 */
		this.core = core;

		/**
		 * 基础模块类
		 * @type  {Class}
		 */
		this.Module = Module;

		/**
		 * 视图基础模块类
		 * @type  {Class}
		 */
		this.Container = Container;
	}

	return new Sugar();
});